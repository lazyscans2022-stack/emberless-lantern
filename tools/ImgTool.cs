// ImgTool.cs: image processing for the game's art (white-background removal, cropping,
// box-filter downscaling to a pixel grid, median-cut palette reduction).
// Compiled and driven by tools/process_art.ps1. Written for the C# 5 compiler in Windows PowerShell 5.1.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class Img
{
    public int W, H;
    public int[] P; // ARGB, row-major

    public Img(int w, int h) { W = w; H = h; P = new int[w * h]; }

    public static Img Load(string path)
    {
        using (var src = new Bitmap(path))
        using (var b = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(b)) g.DrawImage(src, new Rectangle(0, 0, src.Width, src.Height));
            return FromBitmap(b);
        }
    }
    static Img FromBitmap(Bitmap b)
    {
        var img = new Img(b.Width, b.Height);
        var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        for (int y = 0; y < b.Height; y++) Marshal.Copy(IntPtr.Add(d.Scan0, y * d.Stride), img.P, y * b.Width, b.Width);
        b.UnlockBits(d);
        return img;
    }
    Bitmap ToBitmap()
    {
        var b = new Bitmap(W, H, PixelFormat.Format32bppArgb);
        var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        for (int y = 0; y < H; y++) Marshal.Copy(P, y * W, IntPtr.Add(d.Scan0, y * d.Stride), W);
        b.UnlockBits(d);
        return b;
    }
    public void Save(string path) { using (var b = ToBitmap()) b.Save(path, ImageFormat.Png); }

    static int A(int c) { return (c >> 24) & 255; }
    static int R(int c) { return (c >> 16) & 255; }
    static int G(int c) { return (c >> 8) & 255; }
    static int B(int c) { return c & 255; }
    static int Argb(int a, int r, int g, int b) { return (a << 24) | (r << 16) | (g << 8) | b; }

    // ---------------------------------------------------------------- white background removal
    // Flood-fills near-white from the image border, also removes large enclosed pure-white areas
    // (gaps between arms and body), then softens the edge with "colour to alpha" against white.
    public void RemoveWhite(int thr, int pureThr, int enclosedMinArea, int fringe)
    {
        int n = W * H;
        var bg = new bool[n];
        var q = new int[n];
        int qh = 0, qt = 0;
        Func<int, bool> whiteish = delegate (int c)
        {
            int r = R(c), g = G(c), b = B(c);
            int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
            return mn >= thr && mx - mn <= 22;
        };
        for (int x = 0; x < W; x++) { Seed(x, 0, bg, q, ref qt, whiteish); Seed(x, H - 1, bg, q, ref qt, whiteish); }
        for (int y = 0; y < H; y++) { Seed(0, y, bg, q, ref qt, whiteish); Seed(W - 1, y, bg, q, ref qt, whiteish); }
        Flood(bg, q, ref qh, ref qt, whiteish);

        // enclosed pure-white regions
        if (enclosedMinArea > 0)
        {
            var seen = new bool[n];
            var comp = new List<int>();
            Func<int, bool> pure = delegate (int c) { return R(c) >= pureThr && G(c) >= pureThr && B(c) >= pureThr; };
            for (int i = 0; i < n; i++)
            {
                if (bg[i] || seen[i] || !pure(P[i])) continue;
                comp.Clear(); comp.Add(i); seen[i] = true;
                for (int k = 0; k < comp.Count; k++)
                {
                    int p = comp[k], px = p % W, py = p / W;
                    for (int dir = 0; dir < 4; dir++)
                    {
                        int nx = px + (dir == 0 ? 1 : dir == 1 ? -1 : 0), ny = py + (dir == 2 ? 1 : dir == 3 ? -1 : 0);
                        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                        int j = ny * W + nx;
                        if (seen[j] || bg[j] || !pure(P[j])) continue;
                        seen[j] = true; comp.Add(j);
                    }
                }
                if (comp.Count >= enclosedMinArea) foreach (int p in comp) bg[p] = true;
            }
        }

        // distance band next to the removed area, for edge softening
        var band = new int[n];
        for (int i = 0; i < n; i++) band[i] = bg[i] ? 0 : int.MaxValue;
        for (int pass = 1; pass <= fringe; pass++)
        {
            for (int i = 0; i < n; i++)
            {
                if (band[i] != int.MaxValue) continue;
                int x = i % W, y = i / W;
                if ((x > 0 && band[i - 1] == pass - 1) || (x < W - 1 && band[i + 1] == pass - 1) ||
                    (y > 0 && band[i - W] == pass - 1) || (y < H - 1 && band[i + W] == pass - 1)) band[i] = pass;
            }
        }
        for (int i = 0; i < n; i++)
        {
            if (bg[i]) { P[i] = 0; continue; }
            if (band[i] == int.MaxValue) continue;
            int c = P[i];
            int r = R(c), g = G(c), b = B(c);
            double a = Math.Max(255 - r, Math.Max(255 - g, 255 - b)) / 255.0;
            a = Math.Min(1.0, a * 1.6);   // keep light edges mostly solid
            if (a < 0.04) { P[i] = 0; continue; }
            Func<int, int> un = delegate (int v) { return Math.Max(0, Math.Min(255, (int)Math.Round(255 - (255 - v) / a))); };
            P[i] = Argb((int)Math.Round(a * 255), un(r), un(g), un(b));
        }
    }
    void Seed(int x, int y, bool[] bg, int[] q, ref int qt, Func<int, bool> ok)
    {
        int i = y * W + x;
        if (bg[i] || !ok(P[i])) return;
        bg[i] = true; q[qt++] = i;
    }
    void Flood(bool[] bg, int[] q, ref int qh, ref int qt, Func<int, bool> ok)
    {
        while (qh < qt)
        {
            int i = q[qh++], x = i % W, y = i / W;
            if (x > 0) Seed(x - 1, y, bg, q, ref qt, ok);
            if (x < W - 1) Seed(x + 1, y, bg, q, ref qt, ok);
            if (y > 0) Seed(x, y - 1, bg, q, ref qt, ok);
            if (y < H - 1) Seed(x, y + 1, bg, q, ref qt, ok);
        }
    }

    // Erase everything inside a rectangle (used for the Gemini sparkle mark).
    public void Clear(int x0, int y0, int w, int h)
    {
        for (int y = Math.Max(0, y0); y < Math.Min(H, y0 + h); y++)
            for (int x = Math.Max(0, x0); x < Math.Min(W, x0 + w); x++) P[y * W + x] = 0;
    }
    // Cover a rectangle with its mirror image from the other side (for symmetrical frames).
    public void PatchMirrorX(int x0, int y0, int w, int h)
    {
        for (int y = Math.Max(0, y0); y < Math.Min(H, y0 + h); y++)
            for (int x = Math.Max(0, x0); x < Math.Min(W, x0 + w); x++) P[y * W + x] = P[y * W + (W - 1 - x)];
    }
    // Cover a rectangle with pixels copied from dy pixels above (hides the sparkle on opaque art;
    // copying vertically keeps frames and borders intact).
    public void PatchFromAbove(int x0, int y0, int w, int h, int dy)
    {
        for (int y = Math.Max(0, y0); y < Math.Min(H, y0 + h); y++)
            for (int x = Math.Max(0, x0); x < Math.Min(W, x0 + w); x++)
                if (y - dy >= 0) P[y * W + x] = P[(y - dy) * W + x];
    }

    // ---------------------------------------------------------------- geometry
    // Bounding box of pixels with alpha >= minA: returns {x, y, w, h}.
    public int[] BBox(int minA)
    {
        int x0 = W, y0 = H, x1 = -1, y1 = -1;
        for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
                if (A(P[y * W + x]) >= minA) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) return new int[] { 0, 0, W, H };
        return new int[] { x0, y0, x1 - x0 + 1, y1 - y0 + 1 };
    }
    // Crop; areas outside the source become transparent.
    public Img Crop(int x0, int y0, int w, int h)
    {
        var o = new Img(w, h);
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                int sx = x0 + x, sy = y0 + y;
                if (sx >= 0 && sy >= 0 && sx < W && sy < H) o.P[y * w + x] = P[sy * W + sx];
            }
        return o;
    }
    public Img FlipX()
    {
        var o = new Img(W, H);
        for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) o.P[y * W + x] = P[y * W + (W - 1 - x)];
        return o;
    }
    // Paste src centred-bottom or at an offset onto a new transparent canvas.
    public static Img Canvas(Img src, int w, int h, int ox, int oy)
    {
        var o = new Img(w, h);
        for (int y = 0; y < src.H; y++) for (int x = 0; x < src.W; x++)
            {
                int tx = ox + x, ty = oy + y;
                if (tx >= 0 && ty >= 0 && tx < w && ty < h) o.P[ty * w + tx] = src.P[y * src.W + x];
            }
        return o;
    }

    // ---------------------------------------------------------------- resizing
    // Area-average downscale (premultiplied alpha): turns "pixel-look" art into a real pixel grid.
    public Img BoxResize(int tw, int th)
    {
        var o = new Img(tw, th);
        for (int ty = 0; ty < th; ty++)
        {
            int sy0 = (int)((long)ty * H / th), sy1 = Math.Max(sy0 + 1, (int)((long)(ty + 1) * H / th));
            for (int tx = 0; tx < tw; tx++)
            {
                int sx0 = (int)((long)tx * W / tw), sx1 = Math.Max(sx0 + 1, (int)((long)(tx + 1) * W / tw));
                long sa = 0, sr = 0, sg = 0, sb = 0; int cnt = 0;
                for (int y = sy0; y < sy1; y++) for (int x = sx0; x < sx1; x++)
                    {
                        int c = P[y * W + x], a = A(c);
                        sa += a; sr += R(c) * a; sg += G(c) * a; sb += B(c) * a; cnt++;
                    }
                if (sa == 0) { o.P[ty * tw + tx] = 0; continue; }
                o.P[ty * tw + tx] = Argb((int)(sa / cnt), (int)(sr / sa), (int)(sg / sa), (int)(sb / sa));
            }
        }
        return o;
    }
    // Smooth high-quality resize (for the painted portraits, which are not pixel art).
    public Img SmoothResize(int tw, int th)
    {
        using (var src = ToBitmap())
        using (var dst = new Bitmap(tw, th, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(dst))
            using (var ia = new ImageAttributes())
            {
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.CompositingMode = CompositingMode.SourceCopy;
                ia.SetWrapMode(WrapMode.TileFlipXY);
                g.DrawImage(src, new Rectangle(0, 0, tw, th), 0, 0, W, H, GraphicsUnit.Pixel, ia);
            }
            return FromBitmap(dst);
        }
    }

    // ---------------------------------------------------------------- palette
    // Median-cut palette of k colours; every pixel snaps to its nearest palette colour.
    // hardAlpha: alpha becomes 0 or 255 (pixel art); otherwise alpha is kept.
    public int Quantize(int k, bool hardAlpha)
    {
        var cols = new List<int>();
        int step = Math.Max(1, (W * H) / 250000);
        for (int i = 0; i < P.Length; i += step) if (A(P[i]) >= 128) cols.Add(P[i] & 0xFFFFFF);
        if (cols.Count == 0) return 0;
        var boxes = new List<List<int>>(); boxes.Add(cols);
        while (boxes.Count < k)
        {
            int bi = -1, bestRange = -1, bestCh = 0;
            for (int i = 0; i < boxes.Count; i++)
            {
                if (boxes[i].Count < 2) continue;
                for (int ch = 0; ch < 3; ch++)
                {
                    int mn = 255, mx = 0, sh = 16 - ch * 8;
                    foreach (int c in boxes[i]) { int v = (c >> sh) & 255; if (v < mn) mn = v; if (v > mx) mx = v; }
                    // weight by population so big flat areas get enough shades
                    int score = (mx - mn) * (int)Math.Sqrt(boxes[i].Count);
                    if (score > bestRange) { bestRange = score; bi = i; bestCh = ch; }
                }
            }
            if (bi < 0 || bestRange <= 0) break;
            var box = boxes[bi];
            int shift = 16 - bestCh * 8;
            box.Sort(delegate (int a, int b) { return ((a >> shift) & 255).CompareTo((b >> shift) & 255); });
            int mid = box.Count / 2;
            boxes[bi] = box.GetRange(0, mid);
            boxes.Add(box.GetRange(mid, box.Count - mid));
        }
        var pal = new int[boxes.Count];
        for (int i = 0; i < boxes.Count; i++)
        {
            long r = 0, g = 0, b = 0;
            foreach (int c in boxes[i]) { r += (c >> 16) & 255; g += (c >> 8) & 255; b += c & 255; }
            int n = Math.Max(1, boxes[i].Count);
            pal[i] = (int)((r / n) << 16 | (g / n) << 8 | (b / n));
        }
        var cache = new Dictionary<int, int>();
        for (int i = 0; i < P.Length; i++)
        {
            int c = P[i], a = A(c);
            if (hardAlpha) { if (a < 128) { P[i] = 0; continue; } a = 255; }
            else if (a == 0) continue;
            int rgb = c & 0xFFFFFF, m;
            if (!cache.TryGetValue(rgb, out m))
            {
                int best = int.MaxValue;
                int r0 = (rgb >> 16) & 255, g0 = (rgb >> 8) & 255, b0 = rgb & 255;
                m = pal[0];
                foreach (int pc in pal)
                {
                    int dr = r0 - ((pc >> 16) & 255), dg = g0 - ((pc >> 8) & 255), db = b0 - (pc & 255);
                    int d = dr * dr * 3 + dg * dg * 4 + db * db * 2;
                    if (d < best) { best = d; m = pc; }
                }
                cache[rgb] = m;
            }
            P[i] = (a << 24) | m;
        }
        return pal.Length;
    }

    // ---------------------------------------------------------------- components (icon sheets)
    // 8-connected blobs of opaque pixels: list of {x, y, w, h, area}.
    public List<int[]> Components(int minA)
    {
        var res = new List<int[]>();
        var seen = new bool[W * H];
        var stack = new Stack<int>();
        for (int i = 0; i < P.Length; i++)
        {
            if (seen[i] || A(P[i]) < minA) continue;
            int x0 = W, y0 = H, x1 = 0, y1 = 0, area = 0;
            stack.Push(i); seen[i] = true;
            while (stack.Count > 0)
            {
                int p = stack.Pop(), px = p % W, py = p / W; area++;
                if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
                for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                    {
                        int nx = px + dx, ny = py + dy;
                        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                        int j = ny * W + nx;
                        if (seen[j] || A(P[j]) < minA) continue;
                        seen[j] = true; stack.Push(j);
                    }
            }
            res.Add(new int[] { x0, y0, x1 - x0 + 1, y1 - y0 + 1, area });
        }
        return res;
    }

    // ---------------------------------------------------------------- portrait framing helpers
    // Opaque-pixel count per row within columns [x0, x1).
    public int[] RowCounts(int x0, int x1)
    {
        var r = new int[H];
        for (int y = 0; y < H; y++) { int c = 0; for (int x = Math.Max(0, x0); x < Math.Min(W, x1); x++) if (A(P[y * W + x]) >= 128) c++; r[y] = c; }
        return r;
    }
    // Leftmost and rightmost column with at least minCount opaque pixels in rows [y0, y1).
    public int[] ColumnSpan(int y0, int y1, int minCount)
    {
        int l = -1, r = -1;
        for (int x = 0; x < W; x++)
        {
            int c = 0;
            for (int y = Math.Max(0, y0); y < Math.Min(H, y1); y++) if (A(P[y * W + x]) >= 128) c++;
            if (c >= minCount) { if (l < 0) l = x; r = x; }
        }
        return new int[] { l, r };
    }
    // Leftmost and rightmost opaque column in row y.
    public int[] RowSpan(int y)
    {
        int l = -1, r = -1;
        for (int x = 0; x < W; x++) if (A(P[y * W + x]) >= 128) { if (l < 0) l = x; r = x; }
        return new int[] { l, r };
    }
    // Width and centre of the contiguous opaque run through (x, y); allows gaps up to `gap` px.
    public int[] Run(int y, int x, int gap)
    {
        if (y < 0 || y >= H) return new int[] { 0, x };
        int l = x, r = x, miss = 0;
        for (int i = x; i >= 0; i--) { if (A(P[y * W + i]) >= 128) { l = i; miss = 0; } else if (++miss > gap) break; }
        miss = 0;
        for (int i = x; i < W; i++) { if (A(P[y * W + i]) >= 128) { r = i; miss = 0; } else if (++miss > gap) break; }
        return new int[] { r - l + 1, (l + r) / 2 };
    }
    // Mean x of opaque pixels in rows [y0, y1).
    public double CenterX(int y0, int y1)
    {
        double s = 0; long n = 0;
        for (int y = Math.Max(0, y0); y < Math.Min(H, y1); y++) for (int x = 0; x < W; x++) if (A(P[y * W + x]) >= 128) { s += x; n++; }
        return n == 0 ? W / 2.0 : s / n;
    }
    // ---------------------------------------------------------------- walking-frame helpers
    public Img Copy() { var o = new Img(W, H); Array.Copy(P, o.P, P.Length); return o; }
    // Move the pixels of a rectangle by (dx, dy). cut = true leaves the vacated area transparent
    // (a lifted foot); cut = false pastes over the original so no gaps open up (swinging arms, strides).
    public void ShiftRegion(int x0, int y0, int w, int h, int dx, int dy) { ShiftRegion(x0, y0, w, h, dx, dy, true); }
    public void ShiftRegion(int x0, int y0, int w, int h, int dx, int dy, bool cut)
    {
        var buf = new int[w * h];
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                int sx = x0 + x, sy = y0 + y;
                if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
                buf[y * w + x] = P[sy * W + sx]; if (cut) P[sy * W + sx] = 0;
            }
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                int c = buf[y * w + x]; if (A(c) == 0) continue;
                int tx = x0 + x + dx, ty = y0 + y + dy;
                if (tx >= 0 && ty >= 0 && tx < W && ty < H) P[ty * W + tx] = c;
            }
    }
    // Raise everything above row `waist` by one pixel, stretching the waist row (a 1 px walking bob).
    public void Bob(int waist)
    {
        for (int y = 1; y < waist; y++) for (int x = 0; x < W; x++) P[(y - 1) * W + x] = P[y * W + x];
    }
    // If the feet are apart (a mid-step pose), pull the legs together, more at the feet than at the hips.
    // Returns the gap that was closed (0 = already neutral).
    public int CloseLegs(int legTop)
    {
        int foot = H - 1; while (foot > 0 && RowSpan(foot)[0] < 0) foot--;
        int fy = Math.Max(legTop, foot - 1);
        // find the widest transparent gap inside the feet row
        int[] sp = RowSpan(fy); if (sp[0] < 0) return 0;
        int gs = -1, ge = -1, cs = -1;
        for (int x = sp[0]; x <= sp[1]; x++)
        {
            bool solid = A(P[fy * W + x]) >= 128;
            if (!solid && cs < 0) cs = x;
            if (solid && cs >= 0) { if (x - cs > ge - gs) { gs = cs; ge = x; } cs = -1; }
        }
        int gap = ge - gs;
        if (gs < 0 || gap < 2) return 0;
        int mid = (gs + ge) / 2;
        var src = Copy();
        for (int y = legTop; y < H; y++)
        {
            double k = (double)(y - legTop) / Math.Max(1, foot - legTop);
            int sh = (int)Math.Round(k * gap / 2.0);
            if (sh == 0) continue;
            for (int x = 0; x < W; x++) P[y * W + x] = 0;
            for (int x = 0; x < W; x++)
            {
                int c = src.P[y * W + x]; if (A(c) == 0) continue;
                int tx = x < mid ? x + sh : x - sh;
                if (tx >= 0 && tx < W) P[y * W + tx] = c;
            }
        }
        return gap;
    }
    // Darken (multiply) all pixels, used for the game-over fallback.
    public void Darken(double f)
    {
        for (int i = 0; i < P.Length; i++) { int c = P[i]; P[i] = Argb(A(c), (int)(R(c) * f), (int)(G(c) * f), (int)(B(c) * f)); }
    }
}
