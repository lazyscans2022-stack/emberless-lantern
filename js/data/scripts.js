// scripts.js: all dialogue, copied from rpg_design.md §4.
// Edit freely: the text below is parsed when the game starts (see js/script.js).
// Format: SCENE/LOCATION/TRIGGER header, "---" separators, NAME: line, [Label],
// goto X, CHOICE, IF, GIVE, TAKE, GOLD, SET, JOIN, BATTLE, HEAL_PARTY, SHOP, END, END_GAME.
'use strict';
G.SCRIPT_TEXT = String.raw`
SCENE: Village_Intro
LOCATION: Willowmere Village – Rowan's House
TRIGGER: game start
---
ROWAN: Mmh... why is it so dark? It's morning...
ROWAN: Wait. The Lantern. I can't see the Lantern from my window!
ROWAN: I'd better find Elder Hesta.
SET: intro_done
END

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

SCENE: Villager_Lines
LOCATION: Willowmere Village
TRIGGER: talk to VILLAGER_A / VILLAGER_B
---
VILLAGER_A: My cows won't come out of the barn. They know something's wrong.
VILLAGER_B: I heard the thief was a ghost. Or a giant. Or a ghost giant!
END

SCENE: Village_Exit_Block
LOCATION: Willowmere Village – North Exit
TRIGGER: walk to north exit before brann_joined
---
ROWAN: Hesta said not to go alone. I should find Brann at the smithy first.
END

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

SCENE: Doll_Found
LOCATION: Whisperwood Forest – Hidden Hollow Stump
TRIGGER: inspect stump (only if doll_quest_started)
---
ROWAN: There's something stuck inside this stump... a doll with one button eye.
GIVE: Mister Buttons
SET: doll_found
BRANN: He looks like he's seen things.
END

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

SCENE: Ruins_Enter
LOCATION: Ashen Ruins – Gate
TRIGGER: first time entering ruins
---
MIRA: The Ashen Ruins. The first Lantern-keepers built this place.
BRANN: It's a bit... crumbly.
ROWAN: Look, the inner hall is sealed. There are two old levers on either side of the courtyard.
MIRA: Pull both, and the door should open. Probably. Ancient doors are moody.
END

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

SCENE: Save_Point_Ruins
LOCATION: Ashen Ruins – Before Inner Hall
TRIGGER: touch the glowing stone
---
MIRA: This stone still holds a little of the old light. Rest here.
HEAL_PARTY
END

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

SCENE: Morvane_Phase2
LOCATION: Ashen Ruins – Inner Hall
TRIGGER: mid-battle, Morvane HP below 50%
---
MORVANE: No... not yet! Hollow, lend me your strength!
MIRA: He's letting the shadows into his own body. Rowan, use the fire!
END

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
`;
