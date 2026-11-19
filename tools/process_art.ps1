# process_art.ps1: turns the raw Gemini art in assets/source/ into game-ready files in assets/.
# Re-run any time:  powershell -ExecutionPolicy Bypass -File tools\process_art.ps1 [-Only portraits,enemies,icons,backgrounds,battle,ui]
# Needs only Windows PowerShell (it compiles tools/ImgTool.cs on the fly).
param([string[]]$Only = @('backgrounds', 'battle', 'ui', 'enemies', 'icons', 'portraits', 'portraits_pixel', 'maps', 'sprites'))
$ErrorActionPreference = 'Stop'
$Only = @($Only | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() })
$Root = Split-Path $PSScriptRoot -Parent
$Src = Join-Path $Root 'assets\source'
$Out = Join-Path $Root 'assets'
if (-not ('Img' -as [type])) { Add-Type -Path (Join-Path $PSScriptRoot 'ImgTool.cs') -ReferencedAssemblies System.Drawing }

# Game resolution is 320x240. 16:9 art is kept at 430x240 so it can fill the screen at the game's pixel size.
$BG_W = 430; $BG_H = 240

function Hide-Sparkle($img, [switch]$Mirror) {
  # Gemini puts a small sparkle mark in the bottom-right corner of opaque images.
  $s = [int]($img.W * 0.075)
  if ($Mirror) { $img.PatchMirrorX($img.W - $s, $img.H - $s, $s, $s) }   # framed UI art: copy the clean left corner
  else { $img.PatchFromAbove($img.W - $s, $img.H - $s, $s, $s, $s + 10) }
}
function Remove-CornerSpecks($img) {
  # Same mark on white-background images: drop small blobs near the bottom-right corner.
  $lim = [int]($img.W * 0.09)
  foreach ($c in $img.Components(1)) {
    $cx = $c[0] + $c[2] / 2; $cy = $c[1] + $c[3] / 2
    if ($cx -gt $img.W - $lim -and $cy -gt $img.H - $lim -and $c[4] -lt ($img.W * $img.H / 400)) { $img.Clear($c[0], $c[1], $c[2], $c[3]) }
  }
}
function Pixel-Scene($inPath, $outPath, $colors, [switch]$Framed) {
  $img = [Img]::Load($inPath)
  Hide-Sparkle $img -Mirror:$Framed
  $o = $img.BoxResize($BG_W, $BG_H)
  [void]$o.Quantize($colors, $true)
  $o.Save($outPath)
  $o
}

if ($Only -contains 'backgrounds') {
  Get-ChildItem "$Src\backgrounds\bg_*.png" | ForEach-Object {
    [void](Pixel-Scene $_.FullName "$Out\backgrounds\$($_.Name)" 64)
    "background  $($_.Name)"
  }
}
if ($Only -contains 'battle') {
  Get-ChildItem "$Src\battle\*.png" | ForEach-Object {
    [void](Pixel-Scene $_.FullName "$Out\battle\$($_.Name)" 64)
    "battle      $($_.Name)"
  }
}
if ($Only -contains 'ui') {
  Get-ChildItem "$Src\ui\*.png" | ForEach-Object {
    [void](Pixel-Scene $_.FullName "$Out\ui\$($_.Name)" 48 -Framed)
    "ui          $($_.Name)"
  }
  # Temporary title / game-over art until title_bg.png and gameover_bg.png exist (see js/data/art.js).
  $t = Pixel-Scene "$Src\backgrounds\bg_lantern_hill_dark.png" "$Out\ui\title_bg_placeholder.png" 64
  $t.Darken(0.42); $t.Save("$Out\ui\gameover_bg_placeholder.png")
  "ui          title_bg_placeholder.png, gameover_bg_placeholder.png"
}

# Enemies: [max width, max height] in game pixels, whether to mirror so they face the party (right),
# and the smallest enclosed white area (source px) to treat as background (0 = keep, e.g. white eyes).
$ENEMIES = [ordered]@{
  enemy_shade_wisp       = @(40, 40, $false, 0)
  enemy_thornback_boar   = @(64, 46, $true)
  enemy_hollow_wolf      = @(68, 48, $true)
  enemy_cinder_bat       = @(64, 44, $false)
  enemy_ash_knight       = @(52, 64, $false)
  enemy_hollow_shade     = @(46, 72, $false)
  enemy_gloomcap_giant   = @(110, 108, $false)
  enemy_morvane          = @(76, 100, $false)
  enemy_morvane_hollow   = @(76, 100, $false)
}
if ($Only -contains 'enemies') {
  foreach ($name in $ENEMIES.Keys) {
    $cfg = $ENEMIES[$name]
    $img = [Img]::Load("$Src\enemies\$name.png")
    $enc = $(if ($cfg.Count -gt 3) { $cfg[3] } else { 3000 })
    $img.RemoveWhite(232, 248, $enc, 2)
    Remove-CornerSpecks $img
    $bb = $img.BBox(128)
    $img = $img.Crop($bb[0], $bb[1], $bb[2], $bb[3])
    $s = [math]::Min($cfg[0] / $img.W, $cfg[1] / $img.H)
    $o = $img.BoxResize([math]::Max(1, [int]($img.W * $s)), [math]::Max(1, [int]($img.H * $s)))
    [void]$o.Quantize(24, $true)
    if ($cfg[2]) { $o = $o.FlipX() }
    $o.Save("$Out\enemies\$name.png")
    "enemy       $name  $($o.W)x$($o.H)"
  }
}

# Icon sheets: 4 columns x 2 rows each, in the order of gemini_prompts.md.
$SHEETS = [ordered]@{
  icons_consumables = 'potion', 'hi_potion', 'ether', 'antidote', 'phoenix_feather', 'gold', 'boar_hide', 'mister_buttons'
  icons_weapons     = 'wooden_sword', 'iron_sword', 'steel_sword', 'smiths_hammer', 'war_hammer', 'oak_staff', 'moonwood_staff', 'ember_heart'
  icons_armour      = 'cloth_tunic', 'leather_vest', 'chain_mail', 'ward_ring', 'moonleaf_charm', 'shield', 'boot', 'scroll'
}
if ($Only -contains 'icons') {
  foreach ($sheet in $SHEETS.Keys) {
    $names = $SHEETS[$sheet]
    $img = [Img]::Load("$Src\icons\$sheet.png")
    $img.RemoveWhite(232, 248, 300, 2)
    Remove-CornerSpecks $img
    $comps = @($img.Components(128) | Where-Object { $_[4] -ge 20 })
    $big = @($comps | Sort-Object { $_[4] } -Descending | Select-Object -First 8)
    if ($big.Count -lt 8) { throw "$sheet : found only $($big.Count) icons" }
    $centers = $big | ForEach-Object { , @(($_[0] + $_[2] / 2), ($_[1] + $_[3] / 2)) }
    $byY = @($centers | Sort-Object { $_[1] })
    $ordered = @($byY[0..3] | Sort-Object { $_[0] }) + @($byY[4..7] | Sort-Object { $_[0] })
    # union every blob (sparkles, small bits) into the nearest icon
    $boxes = @(); for ($i = 0; $i -lt 8; $i++) { $boxes += , @([int]::MaxValue, [int]::MaxValue, -1, -1) }
    foreach ($c in $comps) {
      $cx = $c[0] + $c[2] / 2; $cy = $c[1] + $c[3] / 2; $bi = 0; $bd = [double]::MaxValue
      for ($i = 0; $i -lt 8; $i++) { $d = [math]::Pow($cx - $ordered[$i][0], 2) + [math]::Pow($cy - $ordered[$i][1], 2); if ($d -lt $bd) { $bd = $d; $bi = $i } }
      $b = $boxes[$bi]
      $b[0] = [math]::Min($b[0], $c[0]); $b[1] = [math]::Min($b[1], $c[1])
      $b[2] = [math]::Max($b[2], $c[0] + $c[2]); $b[3] = [math]::Max($b[3], $c[1] + $c[3])
    }
    for ($i = 0; $i -lt 8; $i++) {
      $b = $boxes[$i]; $w = $b[2] - $b[0]; $h = $b[3] - $b[1]; $side = [math]::Max($w, $h)
      $crop = $img.Crop($b[0] - [int](($side - $w) / 2), $b[1] - [int](($side - $h) / 2), $side, $side)
      $small = $crop.BoxResize(30, 30)
      $icon = [Img]::Canvas($small, 32, 32, 1, 1)
      [void]$icon.Quantize(20, $true)
      $icon.Save("$Out\icons\icon_$($names[$i]).png")
    }
    "icons       $sheet -> $($names -join ', ')"
  }
  Remove-Item "$Out\icons\icons_*.png" -ErrorAction SilentlyContinue   # sheets live in assets/source/icons
}

# Portraits: same chest-up framing for everyone. Every crop has the same height, anchored on the top
# of the head (Gemini draws all characters at about the same scale), and is as wide as that character's
# shoulders, arms and props so the outline is never cut at the sides; only the bottom edge is cut.
# Per-character nudges, in source pixels: headTop, scale (>1 = zoom out).
$PORTRAIT_FIX = @{
}
$P_H = 400                      # output height; width follows the character
$CROP_H = 1300; $MARGIN = 80    # source pixels: crop height and space above the head
$SIDE_PAD = 24                  # source pixels of empty space kept left and right of the figure
$CAST = 'rowan', 'brann', 'mira', 'morvane', 'morvane_hollow', 'hesta', 'garrow', 'pip', 'tilly'
# Shared framing: returns the cropped chest-up figure (transparent background) at source resolution.
function Frame-Portrait($path, $name) {
  $img = [Img]::Load($path)
  $img.RemoveWhite(236, 250, 4000, 3)
  Remove-CornerSpecks $img
  $W = $img.W; $H = $img.H
  $cx = $img.CenterX([int]($H * 0.35), [int]($H * 0.6))
  # head top: first row where a narrow band around the body centre is mostly filled
  $hb = [int]($W * 0.06)
  $rc = $img.RowCounts([int]($cx - $hb), [int]($cx + $hb))
  $headTop = 0; for ($y = 0; $y -lt $H; $y++) { if ($rc[$y] -gt 2 * $hb * 0.5) { $headTop = $y; break } }
  $scale = 1.0
  if ($PORTRAIT_FIX[$name]) { $f = $PORTRAIT_FIX[$name]; if ($f.headTop) { $headTop = $f.headTop }; if ($f.scale) { $scale = $f.scale } }
  $ch = [int]($CROP_H * $scale)
  $top = [int]($headTop - $MARGIN * $scale)
  # full width of the figure inside the crop rows (columns with a few solid pixels, ignores stray specks)
  $span = $img.ColumnSpan($top, $top + $ch, 6)
  $x0 = [math]::Max(0, $span[0] - $SIDE_PAD); $x1 = [math]::Min($W - 1, $span[1] + $SIDE_PAD)
  $img.Crop($x0, $top, $x1 - $x0 + 1, $ch)
}
if ($Only -contains 'portraits') {   # painted portraits (kept as a backup set; the game uses portraits_pixel)
  foreach ($name in $CAST) {
    $crop = Frame-Portrait "$Src\portraits\$name.png" $name
    $outW = [int]([math]::Round($crop.W * $P_H / $crop.H))
    $crop.SmoothResize($outW, $P_H).Save("$Out\portraits\$name.png")
    "portrait    $name  ${outW}x$P_H"
  }
}
# Pixel portraits (used in game): same framing, then snapped to a real pixel grid at game size.
$PP_H = 120   # game pixels tall (shown above the dialogue box)
if ($Only -contains 'portraits_pixel') {
  foreach ($name in $CAST) {
    $crop = Frame-Portrait "$Src\portraits_pixel\${name}_pixel.png" $name
    $outW = [int]([math]::Round($crop.W * $PP_H / $crop.H))
    $o = $crop.BoxResize($outW, $PP_H)
    [void]$o.Quantize(40, $true)
    $o.Save("$Out\portraits_pixel\${name}_pixel.png")
    "pixel port  ${name}_pixel  ${outW}x$PP_H"
  }
}

# Walking sprites: each source has 3 standing poses (down, side, up). We cut them out, scale every
# direction by the same factor (so they share one height), straighten mid-step side poses, mirror the
# side view, build two stepping frames per direction (legs + arms move, 1 px bob, head unchanged)
# and export a 3x4 sheet in RPG Maker order: rows down, left, right, up; columns step, stand, step.
# h = height in game px (a map doorway is ~45 px, about 1.5x an adult); side = which way the side pose faces.
$SPRITES = [ordered]@{
  rowan   = @{ h = 30; side = 'right' }   # checked on the source art: his profile faces right
  brann   = @{ h = 32; side = 'right' }
  mira    = @{ h = 30; side = 'right' }
  hesta   = @{ h = 28; side = 'left' }
  garrow  = @{ h = 31; side = 'left' }
  morvane = @{ h = 33; side = 'left' }
  pip     = @{ h = 25; side = 'left' }
  tilly   = @{ h = 22; side = 'right' }
}
function Front-Step($p, [bool]$liftLeft) {
  $f = $p.Copy(); $legTop = [int]($p.H * 0.68)
  $f.Bob($legTop)
  $sp = $p.ColumnSpan($legTop, $p.H, 1); $cx = [int](($sp[0] + $sp[1]) / 2)
  if ($liftLeft) { $f.ShiftRegion($sp[0], $legTop, $cx - $sp[0], $p.H - $legTop, 0, -1) }
  else { $f.ShiftRegion($cx, $legTop, $sp[1] - $cx + 1, $p.H - $legTop, 0, -1) }
  # arms swing against the legs
  $a0 = [int]($p.H * 0.36); $asp = $p.ColumnSpan($a0, $legTop, 1); $aw = [math]::Max(2, [int](($asp[1] - $asp[0]) * 0.2))
  $f.ShiftRegion($asp[0], $a0 - 1, $aw, $legTop - $a0, 0, $(if ($liftLeft) { 1 } else { -1 }), $false)
  $f.ShiftRegion($asp[1] - $aw + 1, $a0 - 1, $aw, $legTop - $a0, 0, $(if ($liftLeft) { -1 } else { 1 }), $false)
  $f
}
function Side-Step($p, [bool]$facingRight, [bool]$liftFront) {
  $f = $p.Copy(); $legTop = [int]($p.H * 0.66)
  $f.Bob($legTop)
  $sp = $p.ColumnSpan($legTop, $p.H, 1); $cx = [int](($sp[0] + $sp[1]) / 2)
  $dir = $(if ($facingRight) { 1 } else { -1 })
  # stride: the front leg reaches forward, the back leg pushes back (pasted over, so no gaps)
  if ($facingRight) { $bx = $sp[0]; $bw = $cx - $sp[0]; $fx = $cx; $fw = $sp[1] - $cx + 1 } else { $fx = $sp[0]; $fw = $cx - $sp[0]; $bx = $cx; $bw = $sp[1] - $cx + 1 }
  $f.ShiftRegion($fx, $legTop, $fw, $p.H - $legTop, $dir, 0, $false)
  $f.ShiftRegion($bx, $legTop, $bw, $p.H - $legTop, -$dir, 0, $false)
  # one foot lifts off the ground, alternating between the two frames
  if ($liftFront) { $f.ShiftRegion($fx + $dir, $p.H - 3, $fw, 3, 0, -1) } else { $f.ShiftRegion($bx - $dir, $p.H - 3, $bw, 3, 0, -1) }
  # the arm swings against the lifted leg
  $a0 = [int]($p.H * 0.38); $asp = $p.ColumnSpan($a0, $legTop, 1); $mid = [int](($asp[0] + $asp[1]) / 2); $aw = [math]::Max(2, [int](($asp[1] - $asp[0]) * 0.35))
  $f.ShiftRegion($mid - [int]($aw / 2), $a0 - 1, $aw, $legTop - $a0, $(if ($liftFront) { -$dir } else { $dir }), 0, $false)
  $f
}
if ($Only -contains 'sprites') {
  New-Item -ItemType Directory -Force "$Out\sprites" | Out-Null
  foreach ($name in $SPRITES.Keys) {
    $cfg = $SPRITES[$name]
    $spriteFile = Get-ChildItem "$Src\sprites\*$name*" | Select-Object -First 1
    if (-not $spriteFile) { "sprite      $name  (missing)"; continue }
    $img = [Img]::Load($spriteFile.FullName)
    $img.RemoveWhite(232, 248, 3000, 2)
    Remove-CornerSpecks $img
    $comps = @($img.Components(128) | Where-Object { $_[4] -ge 40 })
    $big = @($comps | Sort-Object { $_[4] } -Descending | Select-Object -First 3 | Sort-Object { $_[0] })
    if ($big.Count -lt 3) { throw "$name : found $($big.Count) poses" }
    $boxes = @(); foreach ($b in $big) { $boxes += , @($b[0], $b[1], ($b[0] + $b[2]), ($b[1] + $b[3])) }
    foreach ($c in $comps) {   # staffs, sparkles and loose bits join the nearest pose
      $cx = $c[0] + $c[2] / 2; $bi = 0; $bd = [double]::MaxValue
      for ($i = 0; $i -lt 3; $i++) { $d = [math]::Abs($cx - ($big[$i][0] + $big[$i][2] / 2)); if ($d -lt $bd) { $bd = $d; $bi = $i } }
      $b = $boxes[$bi]; $b[0] = [math]::Min($b[0], $c[0]); $b[1] = [math]::Min($b[1], $c[1]); $b[2] = [math]::Max($b[2], $c[0] + $c[2]); $b[3] = [math]::Max($b[3], $c[1] + $c[3])
    }
    $raw = @(); foreach ($b in $boxes) { $raw += , $img.Crop($b[0], $b[1], $b[2] - $b[0], $b[3] - $b[1]) }
    $scale = $cfg.h / $raw[0].H                     # same factor for all three directions
    $poses = @(); foreach ($r in $raw) { $o = $r.BoxResize([math]::Max(1, [int][math]::Round($r.W * $scale)), [math]::Max(1, [int][math]::Round($r.H * $scale))); [void]$o.Quantize(24, $true); $poses += , $o }
    $down = $poses[0]; $side = $poses[1]; $up = $poses[2]
    $closed = $side.CloseLegs([int]($side.H * 0.62))
    $left = $(if ($cfg.side -eq 'left') { $side } else { $side.FlipX() })
    $right = $left.FlipX()
    $rows = @(
      @((Front-Step $down $true), $down, (Front-Step $down $false)),
      @((Side-Step $left $false $true), $left, (Side-Step $left $false $false)),
      @((Side-Step $right $true $true), $right, (Side-Step $right $true $false)),
      @((Front-Step $up $false), $up, (Front-Step $up $true))
    )
    $cw = ($poses | ForEach-Object { $_.W } | Measure-Object -Maximum).Maximum + 4
    $chh = ($poses | ForEach-Object { $_.H } | Measure-Object -Maximum).Maximum + 2
    $sheet = New-Object Img ($cw * 3), ($chh * 4)
    for ($r = 0; $r -lt 4; $r++) { for ($c = 0; $c -lt 3; $c++) {
        $fr = $rows[$r][$c]
        $cell = [Img]::Canvas($fr, $cw, $chh, [int](($cw - $fr.W) / 2), $chh - 1 - $fr.H)
        for ($y = 0; $y -lt $chh; $y++) { [Array]::Copy($cell.P, $y * $cw, $sheet.P, ($r * $chh + $y) * $sheet.W + $c * $cw, $cw) }
    } }
    $sheet.Save("$Out\sprites\${name}_sheet.png")
    "sprite      $name  frame ${cw}x$chh  (side pose $(if ($closed) { "straightened, gap $closed px" } else { 'already neutral' }))"
  }
  Get-ChildItem "$Out\sprites\sprite_*.png" -ErrorAction SilentlyContinue | Remove-Item   # sources live in assets/source/sprites
}

# Maps: outdoor maps at 1/4 size (the screen then shows about a quarter of each map),
# rooms at 1/9 so furniture suits the 30 px characters, the great hall at 1/6.
$MAPS = [ordered]@{
  map_village = 4; map_village_lit = 4; map_forest = 4; map_ruins = 4
  map_rowan_house = 9; map_hesta_hut = 9; map_mira_cottage = 9; map_pip_shop = 9; map_smithy = 9; map_ruins_hall = 6
}
if ($Only -contains 'maps') {
  foreach ($name in $MAPS.Keys) {
    $f = Get-ChildItem "$Src\maps\$name.*" | Select-Object -First 1
    if (-not $f) { "map         $name  (missing, skipped)"; continue }
    $img = [Img]::Load($f.FullName)
    Hide-Sparkle $img        # outdoor: covered with scenery from above; rooms: covered with the black border
    $d = $MAPS[$name]
    $o = $img.BoxResize([int]($img.W / $d), [int]($img.H / $d))
    [void]$o.Quantize(96, $true)
    $o.Save("$Out\maps\$name.png")
    "map         $name  $($o.W)x$($o.H)"
  }
  Remove-Item "$Out\maps\*.jpg" -ErrorAction SilentlyContinue   # the .jpg originals live in assets/source/maps
}
