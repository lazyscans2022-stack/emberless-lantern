# The Emberless Lantern — RPG Design Document

Small classic-fantasy, turn-based browser RPG. 3 areas, 3 party members, 1 mini-boss, 1 final boss. Target play time: about 30 minutes.

## Script commands used in this document

The dialogue uses the requested format, plus a few extra commands. Implement all of these:

| Command | Meaning |
|---|---|
| `NAME: text` | A line of dialogue spoken by NAME |
| `CHOICE: "A" -> goto X \| "B" -> goto Y` | Player picks an option, jump to label |
| `[Label]` | Jump target inside a scene |
| `GIVE: Item` / `TAKE: Item` | Add / remove an item |
| `GOLD: +N` | Give gold |
| `SET: flag` | Set a story flag to true |
| `IF: flag -> goto X` | Jump if flag is set (otherwise continue) |
| `JOIN: Name` | Character joins the party |
| `BATTLE: Enemy` | Start a battle; the scene continues after a win |
| `HEAL_PARTY` | Fully restore HP/MP of the party |
| `SHOP: Shop_Name` | Open a shop menu |
| `END` | End the scene |
| `END_GAME` | Roll credits |

---

## 1. Game overview

**The Emberless Lantern** is a light-hearted classic fantasy RPG with turn-based combat. For three hundred years the Sky Lantern on the hill above the village of Willowmere has burned with the Ember Heart, a magical flame whose light keeps the shadow creatures called the Hollow away. One night the Lantern goes dark: the Ember Heart has been stolen. Rowan, a young farmhand, sets out with Brann, the blacksmith's son, and Mira, a forest herbalist, through Whisperwood Forest to the Ashen Ruins to get it back. The thief, Morvane, is a former apprentice keeper of the Lantern. He doesn't want power. He wants the Heart to open the Hollow and bring back the sister he lost to it. At the end the player chooses whether to spare him.

- **Tone:** warm, a bit funny, with one sad and sincere villain
- **Combat:** turn-based, party of up to 3, menu: Attack / Skill / Item / Defend / Flee (no fleeing from bosses)
- **Areas:** Willowmere Village (hub), Whisperwood Forest, Ashen Ruins
- **Length:** about 30 minutes; level cap 10

---

## 2. Story outline

**Setting.** Willowmere is a small farming village at the edge of Whisperwood. Above it, on Lantern Hill, stands the Sky Lantern. Elder Hesta, the last Lantern-keeper, has tended it all her life. The Hollow are shadow beasts that come out of the dark, and the Lantern's light has always kept them out of the valley.

**Act 1: The Dark Morning (Willowmere Village).**
Rowan wakes to find the Lantern dark and the village frightened. Elder Hesta explains that the Ember Heart was stolen and that tracks lead north into Whisperwood. She gives Rowan her old Iron Sword. Brann, the blacksmith's son, who has been wanting an adventure, insists on coming along.
*Goal:* talk to Hesta, recruit Brann, leave by the north exit.

**Act 2: Whisperwood (Whisperwood Forest).**
Without the Lantern, the Hollow have started creeping into the forest. The party meets Mira, a sharp-tongued herbalist whose cottage is now surrounded by shadows. She has seen a robed figure carrying a burning stone toward the Ashen Ruins, and she joins them. The path to the ruins is blocked by the Gloomcap Giant, a huge mushroom swollen by Hollow magic.
*Goal:* find Mira, defeat the Gloomcap Giant, go on to the Ruins.

**Act 3: The Ashen Ruins (Ashen Ruins).**
The ruins are an old fortress built by the first Lantern-keepers. Two old levers open the sealed inner hall. Inside, Morvane is using the Ember Heart to tear open a doorway to the Hollow. He reveals that his younger sister, Lira, was taken by the Hollow years ago, and that Hesta's order refused to use the Heart to go after her. The party fights him. At half health he merges with the Hollow, and the battle gets harder.
*Goal:* pull both levers, defeat Morvane.

**Ending.**
Morvane is defeated, and the doorway to the Hollow flickers shut. The player chooses:
- **Spare him:** Rowan offers him a place back in Willowmere. Hesta takes him back as an apprentice, and the epilogue shows him tending the Lantern and searching for a safe way to find Lira.
- **Banish him:** Morvane walks off into the wastes, alone. The epilogue mentions a robed figure seen far away, watching the Lantern.

In both endings the party carries the Ember Heart back up Lantern Hill and relights the Lantern. Credits roll.

---

## 3. Characters

### Party members

**ROWAN**, hero (player character)
- Look: messy brown hair, green tunic, brown boots, red scarf
- Personality: kind, a little nervous, brave when it counts, makes bad jokes when scared
- Class: Swordsman
- Starting stats (Lv 1): HP 60, MP 15, ATK 12, DEF 8, SPD 10
- Growth per level: HP +8, MP +2, ATK +2, DEF +1, SPD +1
- Skills:
  - **Twin Slash** (3 MP): hits one enemy twice at 70% damage each (Lv 1)
  - **Rally** (5 MP): party ATK +20% for 3 turns (Lv 3)
  - **Ember Strike** (6 MP): fire attack, 1.8× damage; double damage against Hollow-type enemies (learned at the end of Act 2)

**BRANN**, party member (joins in Act 1)
- Look: big and broad, short red beard, leather apron over chainmail, carries a hammer
- Personality: loud, cheerful, loyal, loves food, terrible at whispering
- Class: Guardian (tank)
- Starting stats (Lv 1): HP 85, MP 10, ATK 10, DEF 14, SPD 6
- Growth per level: HP +11, MP +1, ATK +2, DEF +2, SPD +0.5 (round down)
- Skills:
  - **Hammer Blow** (4 MP): 1.5× damage, 30% chance to stun for 1 turn (Lv 1)
  - **Taunt** (3 MP): enemies target Brann for 2 turns (Lv 1)
  - **Shield Wall** (5 MP): party DEF +50% for 2 turns (Lv 4)

**MIRA**, party member (joins in Act 2)
- Look: long silver-white hair in a braid, dark green cloak, a satchel of herbs, wooden staff
- Personality: sarcastic, clever, secretly caring, hates being called "witch"
- Class: Herbalist (healer and mage)
- Starting stats (joins at Lv 3): HP 48, MP 38, ATK 7, DEF 6, SPD 13
- Growth per level: HP +5, MP +4, ATK +1, DEF +1, SPD +1
- Skills:
  - **Mend** (4 MP): restore 30 HP to one ally
  - **Spark** (3 MP): magic damage of 14 + 2 per level, ignores DEF
  - **Thornbind** (4 MP): enemy SPD −50% for 2 turns
  - **Moonleaf** (8 MP): restore 20 HP to the whole party (Lv 5)

### Villain

**MORVANE**, final boss
- Look: tall and thin, grey hooded robe with torn gold trim, pale face, glowing orange hands from holding the Ember Heart
- Personality: quiet, tired, bitter, not cruel; truly believes he is doing the right thing
- Stats: see Enemies section

### NPCs

| Name | Role | Look | Personality |
|---|---|---|---|
| **HESTA** | Village elder, Lantern-keeper, quest giver | Old woman, white bun, blue shawl, walking stick | Calm, wise, carries guilt about Morvane |
| **GARROW** | Blacksmith, Brann's father | Bald, grey beard, huge arms, soot-stained | Gruff, proud of his son, worries a lot |
| **PIP** | Shopkeeper | Short and round, yellow vest, spectacles | Chatty, a bit greedy, harmless |
| **TILLY** | Village child, side quest | Small, pigtails, pink dress | Sad about her lost doll |
| **VILLAGER_A** | Farmer | Straw hat, overalls | Worried |
| **VILLAGER_B** | Washerwoman | Headscarf, apron | Gossip |

---

## 4. Scripts

### Act 1: Willowmere Village

```
SCENE: Village_Intro
LOCATION: Willowmere Village – Rowan's House
TRIGGER: game start
---
ROWAN: Mmh... why is it so dark? It's morning...
ROWAN: Wait. The Lantern. I can't see the Lantern from my window!
ROWAN: I'd better find Elder Hesta.
SET: intro_done
END
```

```
SCENE: Elder_Quest
LOCATION: Willowmere Village – Elder's Hut
TRIGGER: talk to HESTA
---
IF: quest_forest_started -> goto Reminder
HESTA: Rowan. You saw it too, then. The Lantern is dark.
ROWAN: What happened? It's never gone out before.
HESTA: Someone climbed Lantern Hill last night and took the Ember Heart.
HESTA: Without its light, the Hollow will reach the village within days.
ROWAN: The Hollow? I thought those were just stories to scare kids.
HESTA: Stories are usually true, child. That is what makes them scary.
HESTA: The thief's tracks lead north, into Whisperwood. I am too old to follow them.
CHOICE: "I'll go." -> goto Accept | "Why me?" -> goto WhyMe
---
[WhyMe]
HESTA: Because you were the first one to come and ask what happened.
HESTA: That is how heroes usually start.
ROWAN: ...That's a terrible reason. Fine. I'll go.
goto Accept
---
[Accept]
HESTA: Take this. It was my sword, a long time ago.
GIVE: Iron Sword
HESTA: And don't go alone. Garrow's boy has been begging for an adventure since he could walk.
SET: quest_forest_started
END
---
[Reminder]
HESTA: The tracks lead north, into Whisperwood. Be careful, Rowan.
END
```

```
SCENE: Smithy_Brann
LOCATION: Willowmere Village – Smithy
TRIGGER: talk to GARROW or BRANN
---
IF: brann_joined -> goto After
IF: quest_forest_started -> goto Recruit
GARROW: Forge is cold today, lad. Nobody wants swords when the sky's gone dark.
BRANN: I want swords! I always want swords.
END
---
[Recruit]
BRANN: ROWAN! Is it true? Hesta's sending you after the thief?
ROWAN: Keep your voice down, Brann.
BRANN: THIS IS MY QUIET VOICE.
GARROW: He's been sharpening that hammer since sunrise. I think he's coming with you whether I like it or not.
BRANN: Please, Da. Someone's got to stand in front of Rowan when things bite.
GARROW: ...Bring him back in one piece. Both of you.
JOIN: Brann
SET: brann_joined
BRANN: Adventure! Do we get snacks on adventures?
ROWAN: We get monsters.
BRANN: Monsters AND snacks, then.
END
---
[After]
GARROW: Look after each other out there.
SHOP: Smithy
END
```

```
SCENE: Shop_Pip
LOCATION: Willowmere Village – Pip's Shop
TRIGGER: talk to PIP
---
IF: hides_done -> goto Shop
IF: hides_quest_started -> goto CheckHides
PIP: Welcome, welcome! Dark times are bad for business, but good for potions!
PIP: Say, if you're heading into the forest, could you bring me 3 Boar Hides? Thornback Boars drop them.
PIP: I'll pay you well. Well-ish. Fairly.
SET: hides_quest_started
goto Shop
---
[CheckHides]
IF: has_3_boar_hides -> goto PayHides
PIP: Still need those 3 Boar Hides, friend!
goto Shop
---
[PayHides]
TAKE: Boar Hide
TAKE: Boar Hide
TAKE: Boar Hide
PIP: Ooh, lovely and stinky! Here's your payment, as promised.
GOLD: +60
GIVE: Hi-Potion
SET: hides_done
goto Shop
---
[Shop]
SHOP: Pip_Shop
END
```

*(Note for the developer: `has_3_boar_hides` is a check of the inventory, not a story flag.)*

```
SCENE: Tilly_Doll
LOCATION: Willowmere Village – Town Square
TRIGGER: talk to TILLY
---
IF: doll_returned -> goto Thanks
IF: doll_found -> goto Return
TILLY: *sniff* I lost Mister Buttons in the forest yesterday, before it got dark.
TILLY: He's a doll with one button eye. Can you find him?
ROWAN: I'll keep an eye out. Er, sorry. No pun intended.
SET: doll_quest_started
END
---
[Return]
TILLY: MISTER BUTTONS! You found him!
TAKE: Mister Buttons
TILLY: Here, you can have Mummy's lucky ring. She says I'm allowed to give it to heroes.
GIVE: Ward Ring
SET: doll_returned
END
---
[Thanks]
TILLY: Mister Buttons says thank you. He's very polite.
END
```

```
SCENE: Villager_Lines
LOCATION: Willowmere Village
TRIGGER: talk to VILLAGER_A / VILLAGER_B
---
VILLAGER_A: My cows won't come out of the barn. They know something's wrong.
VILLAGER_B: I heard the thief was a ghost. Or a giant. Or a ghost giant!
END
```

```
SCENE: Village_Exit_Block
LOCATION: Willowmere Village – North Exit
TRIGGER: walk to north exit before brann_joined
---
ROWAN: Hesta said not to go alone. I should find Brann at the smithy first.
END
```

### Act 2: Whisperwood Forest

```
SCENE: Forest_Enter
LOCATION: Whisperwood Forest – Entrance
TRIGGER: first time entering forest
---
BRANN: It's... very quiet.
ROWAN: You noticed it too?
BRANN: No birds. No bugs. Just shadows moving where shadows shouldn't move.
ROWAN: The Hollow. Stay close.
BRANN: I'm ALWAYS close. I'm very big.
END
```

```
SCENE: Mira_Cottage
LOCATION: Whisperwood Forest – Mira's Clearing
TRIGGER: enter clearing
---
MIRA: Hold it! One more step and I'll turn you both into toads.
BRANN: Can you really do that?
MIRA: No. But you looked worried for a second, which was satisfying.
ROWAN: We're from Willowmere. We're chasing whoever stole the Ember Heart.
MIRA: So that's why my garden is full of shadows. I saw him. Robed fellow, hands glowing like coals.
MIRA: He went toward the Ashen Ruins two nights ago.
CHOICE: "Come with us?" -> goto Join | "Thanks for the help." -> goto Leave
---
[Leave]
MIRA: Hah. You'll be dead in an hour. Fine, I'm coming. Someone has to heal you.
goto Join
---
[Join]
MIRA: I'm Mira. Herbalist. NOT a witch, before anyone asks.
BRANN: I wasn't going to ask!
BRANN: ...Are you a witch, though?
MIRA: Rest first. You both look terrible.
HEAL_PARTY
JOIN: Mira
SET: mira_joined
END
```

```
SCENE: Doll_Found
LOCATION: Whisperwood Forest – Hidden Hollow Stump
TRIGGER: inspect stump (only if doll_quest_started)
---
ROWAN: There's something stuck inside this stump... a doll with one button eye.
GIVE: Mister Buttons
SET: doll_found
BRANN: He looks like he's seen things.
END
```

```
SCENE: Gloomcap_Battle
LOCATION: Whisperwood Forest – Gloomcap Glade
TRIGGER: approach glade (needs mira_joined)
---
IF: gloomcap_defeated -> goto Done
MIRA: Careful. That mushroom isn't supposed to be the size of a house.
BRANN: I'll squash it!
MIRA: The Hollow's magic has swollen it. Its spores are poison. Try to end this fast.
BATTLE: Gloomcap_Giant
SET: gloomcap_defeated
MIRA: Disgusting. But the path to the ruins is clear.
ROWAN: Something feels... warm. Like the Lantern's light is calling to me.
MIRA: Your sword's glowing. The Ember Heart must be close, and Hesta's old blade remembers it.
ROWAN: I think I can use that power. (Rowan learned Ember Strike!)
SET: ember_strike_learned
END
---
[Done]
END
```

### Act 3: Ashen Ruins

```
SCENE: Ruins_Enter
LOCATION: Ashen Ruins – Gate
TRIGGER: first time entering ruins
---
MIRA: The Ashen Ruins. The first Lantern-keepers built this place.
BRANN: It's a bit... crumbly.
ROWAN: Look, the inner hall is sealed. There are two old levers on either side of the courtyard.
MIRA: Pull both, and the door should open. Probably. Ancient doors are moody.
END
```

```
SCENE: Lever_East
LOCATION: Ashen Ruins – East Wing
TRIGGER: interact with east lever
---
IF: lever_east -> goto Done
BRANN: Let me! *CLUNK*
SET: lever_east
IF: lever_west -> goto Open
MIRA: One down.
END
---
[Open]
ROWAN: That's both! Listen. The hall door is opening.
SET: hall_open
END
---
[Done]
BRANN: Already pulled it. I pulled it very well.
END
```

```
SCENE: Lever_West
LOCATION: Ashen Ruins – West Wing
TRIGGER: interact with west lever
---
IF: lever_west -> goto Done
ROWAN: Heavy... got it!
SET: lever_west
IF: lever_east -> goto Open
MIRA: One down.
END
---
[Open]
ROWAN: That's both! Listen. The hall door is opening.
SET: hall_open
END
---
[Done]
ROWAN: This one's already down.
END
```

```
SCENE: Save_Point_Ruins
LOCATION: Ashen Ruins – Before Inner Hall
TRIGGER: touch the glowing stone
---
MIRA: This stone still holds a little of the old light. Rest here.
HEAL_PARTY
END
```

```
SCENE: Morvane_Confront
LOCATION: Ashen Ruins – Inner Hall
TRIGGER: enter inner hall (needs hall_open)
---
MORVANE: So Hesta sent children. Of course she did.
ROWAN: Give back the Ember Heart. Willowmere needs it.
MORVANE: Willowmere has had it for three hundred years. I need it for one night.
MIRA: That's a doorway to the Hollow you're tearing open. Are you mad?
MORVANE: My sister, Lira, was taken by the Hollow when we were young. I was Hesta's apprentice then.
MORVANE: I begged her to use the Heart to go after Lira. She said it was too dangerous.
MORVANE: She was wrong. And now I will fix her mistake.
BRANN: If you open that door, everyone in the valley gets hurt!
MORVANE: ...Then I am sorry. Stand aside.
BATTLE: Morvane
END
```

```
SCENE: Morvane_Phase2
LOCATION: Ashen Ruins – Inner Hall
TRIGGER: mid-battle, Morvane HP below 50%
---
MORVANE: No... not yet! Hollow, lend me your strength!
MIRA: He's letting the shadows into his own body. Rowan, use the fire!
END
```

```
SCENE: Morvane_Defeated
LOCATION: Ashen Ruins – Inner Hall
TRIGGER: after defeating Morvane
---
MORVANE: ...It's no use. The door won't stay open. It never would have.
GIVE: Ember Heart
SET: morvane_defeated
MIRA: The doorway's closing. Good.
BRANN: What do we do with him?
CHOICE: "Come home with us." -> goto Spare | "Leave this valley." -> goto Banish
---
[Spare]
ROWAN: Hesta made a choice that hurt you. That doesn't mean she wouldn't listen now.
ROWAN: Come back to Willowmere. Find another way to look for Lira. A safe way.
MORVANE: ...You would bring a thief home?
BRANN: We've got a spare bed. And snacks.
SET: ending_spare
END
---
[Banish]
ROWAN: You nearly doomed everyone. Leave this valley and don't come back.
MORVANE: ...Perhaps that is fair. Tell Hesta I'm sorry, if she cares to hear it.
SET: ending_banish
END
```

### Ending

```
SCENE: Lantern_Relit
LOCATION: Willowmere Village – Lantern Hill
TRIGGER: walk up Lantern Hill with Ember Heart (path unlocks when morvane_defeated)
---
HESTA: You brought it back. All of you.
ROWAN: Will it still work?
HESTA: Place it in the Lantern and see.
TAKE: Ember Heart
ROWAN: ...
MIRA: Look! The light's spreading over the whole valley.
BRANN: The shadows are running away! RUN, SHADOWS! RUN!
IF: ending_spare -> goto Spare
goto Banish
---
[Spare]
MORVANE: Hesta.
HESTA: Morvane. It has been a long time.
HESTA: I was wrong to send you away without an answer. Will you help me tend the Lantern again?
MORVANE: ...Yes. And maybe, together, we can find Lira the right way.
HESTA: Together.
goto Credits
---
[Banish]
HESTA: And Morvane?
ROWAN: Gone. He said to tell you he's sorry.
HESTA: ...So am I. So am I.
MIRA: Look, up on the far ridge. Someone in a grey robe, watching the light.
goto Credits
---
[Credits]
HESTA: Willowmere owes you everything. Rest now, heroes.
END_GAME
```

---

## 5. Enemies and bosses

Hollow-type enemies take double damage from Ember Strike.

### Whisperwood Forest (normal enemies, groups of 1–3)

| Enemy | Look | HP | ATK | DEF | SPD | EXP | Gold | Abilities | Drops |
|---|---|---|---|---|---|---|---|---|---|
| Shade Wisp (Hollow) | small floating purple flame with eyes | 18 | 7 | 3 | 12 | 6 | 5 | **Drain**: takes 4 MP from a target | Ether 10% |
| Thornback Boar | brown boar with green thorns on its back | 30 | 10 | 6 | 7 | 9 | 8 | **Charge**: 1.5× damage, skips its next turn | Boar Hide 50% |
| Hollow Wolf (Hollow) | black wolf with purple glowing eyes | 26 | 11 | 4 | 14 | 10 | 7 | **Howl**: 20% chance to call another Hollow Wolf (max 3) | Potion 15% |

**Mini-boss: Gloomcap Giant** (Gloomcap Glade)
- Look: huge grey-purple mushroom with angry eyes and stubby legs
- HP 140, ATK 12, DEF 8, SPD 5. EXP 60, Gold 50
- **Spore Cloud**: poisons the whole party (4 damage per turn for 3 turns). Used every 3rd turn
- **Regrow**: heals 20 HP. Used when below 40% HP (twice at most)
- **Stomp**: 1.3× damage to one target
- Drops: Moonleaf Charm (guaranteed)

### Ashen Ruins (normal enemies, groups of 1–3)

| Enemy | Look | HP | ATK | DEF | SPD | EXP | Gold | Abilities | Drops |
|---|---|---|---|---|---|---|---|---|---|
| Cinder Bat | orange bat with ember wings | 22 | 9 | 3 | 16 | 9 | 6 | **Burn Bite**: 25% chance to burn (3 damage per turn, 2 turns) | Potion 15% |
| Ash Knight | empty grey armour, glowing slit visor | 48 | 14 | 13 | 7 | 16 | 14 | **Guard**: DEF ×2 for 1 turn | Hi-Potion 10% |
| Hollow Shade (Hollow) | tall shadow-person with no face | 38 | 12 | 6 | 11 | 14 | 10 | **Dark Bolt**: 16 magic damage, ignores DEF | Ether 15% |

**Final boss: Morvane** (Inner Hall)
- Phase 1 (HP 280 → 140): ATK 15, DEF 10, SPD 11
  - **Ember Lash**: 1.4× fire damage to one target
  - **Cinder Rain**: 10 damage to the whole party
  - **Ward**: DEF +50% for 2 turns
- Phase 2 (HP below 140, "Hollow Form": robe turns black, eyes purple). Counts as Hollow-type. ATK 18, SPD 13
  - **Hollow Grasp**: 20 damage plus that target's ATK −30% for 2 turns
  - **Shadow Tide**: 14 damage to the whole party
  - **Drain Light**: heals himself for 25 HP (once only)
- EXP 200, Gold 150. No fleeing.

**Balancing target:** a party at Lv 7–8 with a few Hi-Potions should win in roughly 8–12 turns.

### Experience curve
EXP needed for next level = 20 × current level (so 20 to reach Lv 2, 40 to reach Lv 3, and so on).

---

## 6. Items and equipment

### Consumables

| Item | Effect | Price | Where |
|---|---|---|---|
| Potion | Restore 30 HP to one ally | 15 | Pip's Shop |
| Hi-Potion | Restore 80 HP to one ally | 45 | Pip's Shop (after Act 2) |
| Ether | Restore 15 MP to one ally | 30 | Pip's Shop |
| Antidote | Cure poison and burn | 10 | Pip's Shop |
| Phoenix Feather | Revive a fallen ally with 50% HP | 100 | Pip's Shop (after Act 2) |

### Weapons

| Item | Who | Effect | Price | Where |
|---|---|---|---|---|
| Wooden Sword | Rowan | ATK +2 | — | Starting gear |
| Iron Sword | Rowan | ATK +5 | — | Gift from Hesta |
| Steel Sword | Rowan | ATK +9 | 120 | Smithy |
| Smith's Hammer | Brann | ATK +4 | — | Starting gear |
| War Hammer | Brann | ATK +8 | 120 | Smithy |
| Oak Staff | Mira | ATK +2, Spark +4 damage | — | Starting gear |
| Moonwood Staff | Mira | ATK +4, Spark +8 damage, Mend +10 | 110 | Smithy |

### Armour and accessories

| Item | Effect | Price | Where |
|---|---|---|---|
| Cloth Tunic | DEF +1 | — | Starting gear, all |
| Leather Vest | DEF +3 | 40 | Smithy |
| Chain Mail | DEF +6 (Rowan, Brann only) | 100 | Smithy |
| Ward Ring | DEF +2, SPD +2 | — | Tilly's reward |
| Moonleaf Charm | Max HP +15, restores 3 HP per turn in battle | — | Gloomcap Giant drop |

### Key items

| Item | Purpose |
|---|---|
| Mister Buttons | Tilly's doll (side quest) |
| Boar Hide | Material for Pip's side quest (also sells for 5) |
| Ember Heart | Taken from Morvane; relights the Lantern |

### Shops
- **Pip_Shop:** Potion, Ether, Antidote; adds Hi-Potion and Phoenix Feather once `gloomcap_defeated` is set
- **Smithy** (Garrow, after `brann_joined`): Leather Vest, Chain Mail, Steel Sword, War Hammer, Moonwood Staff

**Starting gold:** 50

---

## 7. Maps and areas

**Willowmere Village** (hub, safe, no battles), about 30×20 tiles
- Grass and dirt paths, wooden fences, a small pond in the south-west
- Town square in the centre with a well; Tilly stands by the well
- Rowan's house in the south (start point)
- Elder Hesta's hut in the north-centre, slightly bigger, with a blue door
- Pip's Shop on the east side of the square (sign with a potion bottle)
- Garrow's Smithy on the west side (anvil outside, smoke from the chimney)
- 3 more houses with villagers outside them
- Path to Lantern Hill in the north-east: blocked by Hesta's guard fence until `morvane_defeated`. The hill top has the big Sky Lantern (dark at first, glowing after the ending)
- North exit leads to Whisperwood (blocked until `brann_joined`)
- Visuals: when the Lantern is dark, the sky is a dim blue-grey tint. After the ending, everything is warm and bright

**Whisperwood Forest** (battles on), about 40×30 tiles
- Winding dirt path through thick trees, with purple shadow patches on the ground
- Entrance in the south, from the village
- Mira's Clearing in the middle-west: small cottage, herb garden, she stands by the door
- A fallen-log bridge over a stream in the middle
- Side path to the east hides the Hollow Stump with Mister Buttons (dead end, a couple of treasure chests: Potion, Ether, 30 gold)
- Gloomcap Glade in the north blocks the path to the Ruins until it's defeated
- North exit leads to the Ashen Ruins

**Ashen Ruins** (battles on), about 30×30 tiles
- Grey crumbling stone, ash on the floor, broken pillars, orange glow coming from the inner hall
- Gate in the south leads into a central courtyard
- East wing has the east lever and a chest (Hi-Potion)
- West wing has the west lever and a chest (Phoenix Feather)
- Glowing save/heal stone just before the inner hall door
- Inner Hall in the north (sealed until `hall_open`), a big room with Morvane and a swirling purple doorway behind him

**Saving:** allow saving from the menu anywhere outside battle, plus the full heal at the stone in the Ruins.

---

## 8. Quests

### Main quest: The Emberless Lantern
1. Talk to Elder Hesta → receive the Iron Sword (`quest_forest_started`)
2. Recruit Brann at the smithy (`brann_joined`)
3. Enter Whisperwood and find Mira (`mira_joined`)
4. Defeat the Gloomcap Giant (`gloomcap_defeated`, Rowan learns Ember Strike)
5. Enter the Ashen Ruins and pull both levers (`hall_open`)
6. Defeat Morvane and choose his fate (`morvane_defeated`, `ending_spare` or `ending_banish`)
7. Climb Lantern Hill and relight the Lantern → ending

### Side quest: Mister Buttons
- Talk to Tilly → find the doll in the forest's Hollow Stump → return it → **Ward Ring**

### Side quest: Pip's Boar Hides
- Talk to Pip → collect 3 Boar Hides from Thornback Boars → **60 gold + Hi-Potion**

### All flags
`intro_done`, `quest_forest_started`, `brann_joined`, `mira_joined`, `doll_quest_started`, `doll_found`, `doll_returned`, `hides_quest_started`, `hides_done`, `gloomcap_defeated`, `ember_strike_learned`, `lever_east`, `lever_west`, `hall_open`, `morvane_defeated`, `ending_spare`, `ending_banish`
