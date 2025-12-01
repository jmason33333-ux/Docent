#!/usr/bin/env node

/**
 * Generate chapter notes for The Way of Kings
 * Usage: node generate-twok-chapters.js <chapterType> <chapterNumber>
 * Example: node generate-twok-chapters.js prologue
 * Example: node generate-twok-chapters.js chapter 1
 */

const fs = require('fs');
const path = require('path');
const { generateContent } = require('./llm-client');
const { getChapterNotesPrompt } = require('./prompts');
const { normalizeBookTitle } = require('../utils/rag-loader');

// Chapter data with summaries
const CHAPTER_DATA = {
  prologue: {
    title: 'To Kill',
    pov: 'Szeth',
    text: `Prologue: To Kill

Characters

Szeth (point of view)

Dalinar Kholin

Elhokar Kholin

Torol Sadeas

Gavilar Kholin

Jasnah Kholin (mentioned only)

Jezrien (mentioned only)

Ishar (mentioned only)

Kalak (mentioned only)

Talenel (mentioned only)

Shalash (mentioned only)

Thaidakar (mentioned only)

Restares (mentioned only)

Plot summary

4500 years later, Szeth, a Truthless Shin assassin, waits quietly in a large room, watching the Alethi celebrate the signing of a peace treaty with the Parshendi. He leaves the room, noting that his Parshendi masters will soon withdraw. Szeth wears white under the orders of the Parshendi to follow their traditions so that King Gavilar could see him coming.

When he reaches the area just outside the King's quarters, Szeth uses his abilities as a Surgebinder to fight his way past the guards. As he reaches the king's quarters, he is confronted by a Shardbearer as the King flees.

Szeth fights his way past the Shardbearer but soon realizes that the Shardbearer, not the man he is chasing, is King Gavilar. He returns and fights him, eventually defeating him by causing the balcony he is standing on to collapse, mortally wounding him. Szeth is nearly killed in the fight. When Szeth tells Gavilar the Parshendi sent him, Gavilar is confused and says, "The Parshendi? That makes no sense."

Gavilar then gives Szeth a strange black sphere and tells him, "You must take this. They must not get it." He then instructs Szeth to tell Gavilar's brother Dalinar that he must "find the most important words a man can say."

As a Shin, Szeth considers a dying wish to be sacred, so he leaves a note for Dalinar written in Gavilar's blood. He takes the sphere and flees.`
  },
  1: {
    title: 'Stormblessed',
    pov: 'Cenn',
    timeContext: 'Five years later',
    text: `Chapter 1: Stormblessed

Characters

Cenn (point of view)

Dallet

Kaladin

Cyn

Korater

Veden Shardbearer

Meridas Amaram (mentioned only)

Gare (mentioned only)

Torol Sadeas (mentioned only)

Gavilar Kholin (mentioned only)

Kusiri (mentioned only)

Hallaw (mentioned only)

Plot summary

Cenn, a new recruit in Brightlord Meridas Amaram's army, is terrified. He is about to face his first battle and has no real idea of what to expect. Cenn is pulled into a new squad, that of Kaladin Stormblessed, at the last minute for reasons he doesn't understand.

Dallet, a sergeant, picks Cenn up and returns him to the squad. They are soon joined by Kaladin, who asks Dallet to take care of Cenn during the battle as he won't know the group's signals. They then fall to discussing tactics.

The opposing force arrives and the battle begins. Kaladin's squad does not lose a single man. At one point, Kaladin singlehandedly fights off six enemy spearmen to save Cenn. When an enemy Brightlord appears, Kaladin and his squad attempt to defeat him. They are hindered, however, by the arrival of an enemy Shardbearer. Cenn blacks out from blood loss, and the scene cuts out.`
  },
  2: {
    title: 'Honor is Dead',
    pov: 'Kaladin',
    timeContext: 'Eight Months Later',
    text: `Chapter 2: Honor is Dead

Characters

Kaladin (point of view)

Tvlakv

Bluth

Syl

Taran

Lirin (mentioned only)

Cenn (mentioned only)

Dallet (mentioned only)

Tukks (mentioned only)

Tien (mentioned only)

Plot summary

Kaladin is now a slave in a caravan, waiting to be sold and struggling to retain his ability to not think like a slave.

When approached by another slave about escaping, Kaladin gruffly tells him that he has no plans to escape because it will never work. A second slave approaches Kaladin and asks how he came to be a slave. When Kaladin doesn't respond, the other men tell their stories. It eventually comes out that Kaladin killed a man, but the one he did not kill is the reason he's a slave.

Kaladin idly toys with a leaf of blackbane, contemplating using it to poison Tvlakv, his slave trader. A windspren in the form of a slender young woman only a handspan tall speaks to Kaladin and wants to know what the blackbane is. Kaladin is surprised that she knows his name. As they converse, he observes that she is much more intelligent than a typical spren. When she asks why he doesn't fight anymore, he says that he has failed.

Kaladin sees Tvlakv going to inspect a sick slave. Kaladin tells him that the man has the grinding coughs and will survive if given extra water. Tvlakv removes the man from the rest of the slaves, and Kaladin thinks he is going to give him water. Instead, Bluth brutally murders the man. Kaladin is upset over his failure to save him.

In his anger at the other slave's murder, he crushed the blackbane against the bars of the wagon, losing most of it.`
  },
  3: {
    title: 'City of Bells',
    pov: 'Shallan Davar',
    text: `Chapter 3: City of Bells

Characters

Shallan Davar (point of view)

Tozbek

Ashlv

Yalb

Jasnah Kholin (mentioned only)

Elhokar Kholin (mentioned only)

Lin Davar (mentioned only)

Valam (mentioned only)

Plot summary

Shallan Davar has just arrived in Kharbranth, the City of Bells. She experiences a culture-shock, amazed at the number and variety of people in the city.

After a short conversation with Captain Tozbek of the Wind's Pleasure, the boat she arrived on, she gets word that Jasnah Kholin, the woman she has been chasing for several months, is still in the city.

Shallan and one of Captain Tozbek's sailors, Yalb, make the trip up to the palace so Shallan can speak to Jasnah. When they arrive, she asks Yalb to wait for her outside the palace. It is revealed that Shallan had requested to be Jasnah's ward, and that Jasnah told her to meet her in Dumadari. Shallan has been chasing her from city to city ever since.

Shallan is very nervous as her house's finances are in ruins since the death of her father, and if she doesn't find some source of income or other means of controlling their rival political houses, her house won't last long. She also reveals that her request to be Jasnah's ward is somehow related to resolving her house's crisis, though she does not make clear how.

The chapter ends with Shallan turning a corner and seeing Jasnah.`
  },
  4: {
    title: 'The Shattered Plains',
    pov: 'Kaladin',
    text: `Chapter 4: The Shattered Plains

Characters

Kaladin (point of view)

Sylphrena

Tvlakv

Bluth

Tag

Meridas Amaram (mentioned only)

Elhokar Kholin (mentioned only)

Roshone (mentioned only)

Katarotam (mentioned only)

Plot summary

Kaladin is sitting in the slave wagon, waiting for the caravan to stop for lunch and noting that it's well after the time the caravan usually stops. After a few minutes, he realizes that it is because Tvlakv is lost. Tvlakv remembers that Kaladin was once an Alethi soldier and might have knowledge of the lands. When he asks Kaladin to help them find the way out, Kaladin tears his map to pieces and tells Tvlakv that he doesn't know the way out.

In the conversation that follows, Tvlakv says that he is only comfortable with the idea of Kaladin escaping because he knows that he wants revenge on Brightlord Amaram more than he does on Tvlakv. Kaladin realizes that if Tvlakv knows about Amaram, then he also knows that Kaladin isn't actually a deserter, in contrast to the official story given when he was sold. Tvlakv acknowledges this but says that it's the story they will stick to because men who are guilty of high crimes are difficult to sell at a good price.

A short time later, the windspren comes back. She had apparently left during the recent highstorm, but now tells Kaladin that there is a large group of people not far away. A few minutes later, Kaladin realizes that it's an Alethi war camp, and that their destination is the Shattered Plains.

The other slaves express hope that they will be treated fairly in the warcamps. Kaladin has his doubts, thinking of the many lighteyes who have proven to be corrupt in the past. His one remaining hope is that he will be allowed to fight again.`
  },
  5: {
    title: 'Heretic',
    pov: 'Shallan Davar',
    text: `Chapter 5: Heretic

Characters

Shallan Davar (point of view)

Jasnah Kholin

Taravangian

Taravangian's granddaughter

Elhokar Kholin (mentioned only)

Tormas (mentioned only)

Nashan (mentioned only)

Niali the Just (mentioned only)

Nohadon (mentioned only)

Placini (mentioned only)

Gabrathin (mentioned only)

Yustara (mentioned only)

Manaline (mentioned only)

Syasikk (mentioned only)

Shauka-daughter-Hasweth (mentioned only)

Barlesha Lhan (mentioned only)

Fabrisan (mentioned only)

Malise Gevelmar (mentioned only)

Plot summary

As Shallan meets Jasnah Kholin for the first time, she admires Jasnah as the ideal beauty – tall, Alethi tan skin, long dark hair. She is talking to a man who Shallan later identifies as King Taravangian of Kharbranth.

Jasnah and Taravangian seem to be negotiating over something, though Shallan can't tell what. As they begin to walk, Jasnah beckons for Shallan to follow. After a preliminary conversation, Jasnah mentions that because Shallan was so persistent in seeking her out, she will hear her petition to be her ward. Shallan is shocked, as she had believed that she had already been accepted as Jasnah's ward.

A lengthy conversation about Shallan's level of education ensues, in which it is decided that Shallan has passing skill in most subjects, is very good in the sciences, excels at drawing and writing (the feminine arts), and is sadly lacking in history and philosophy.

They arrive at the entrance to a room which has been blocked off by a large, fallen stone. Shallan realizes that the king's granddaughter is trapped in the room, and Jasnah is planning to use her Soulcaster to remove the stone in exchange for access to the Palanaeum.

Jasnah Soulcasts the stone, transforming it into smoke. The king retrieves his granddaughter and, when asked, agrees to take Jasnah to the Palanaeum.

Jasnah rejects Shallan as her ward because of her lack of education in history and philosophy. Shallan is frustrated, but decides to persevere. It is then that Shallan reveals that she wishes to become Jasnah's ward not out of scholarly pursuit, but in order to steal her Soulcaster to help her family's finances recover.`
  },
  6: {
    title: 'Bridge Four',
    pov: 'Kaladin',
    text: `Chapter 6: Bridge Four

Characters

Kaladin (point of view)

Tvlakv

Bluth

Tag

Hashal

Gaz

Sylphrena

Gavilar Kholin (mentioned only)

Laral (mentioned only)

Meridas Amaram (mentioned only)

Lamaril (mentioned only)

Torol Sadeas (mentioned only)

Dalinar Kholin (mentioned only)

Plot summary

Kaladin and the rest of the slave caravan have arrived at the Shattered Plains, specifically at the warcamp of Highprince Sadeas. They are taken to a woman who is to decide whether she can use any of the slaves or not. When Kaladin tries to convince her to let him fight, Tvlakv tells her that Kaladin is a deserter, dashing his hopes.

The woman decides that Kaladin and his companions are to be made members of the bridge crews. Kaladin and his new immediate superior, Gaz, take an instant dislike to each other, and as a result, Kaladin is placed in one of the worst locations on the bridge when they are called on a bridge run, without the benefit of shoes or vest for protection.

After several hours of agony carrying the bridge, they arrive at the chasm where the enemy Parshendi are waiting on the other side. They take volleys of arrows while placing their bridge. Kaladin is the only survivor in the front row.

He wakes up hours later when the windspren who's been following him shocks him with some sort of energy. Kaladin realizes that if he doesn't hurry, he will be left behind. The spren tells him that her name is Sylphrena, or Syl.

Though he is exhausted, Kaladin takes a spot on the bridge and begins the long way back to camp.`
  },
  7: {
    title: 'Anything Reasonable',
    pov: 'Shallan Davar',
    text: `Chapter 7: Anything Reasonable

Characters

Shallan Davar (point of view)

Kabsal

Jasnah Kholin

Lin Davar (mentioned only)

Luesh (mentioned only)

Balat Davar (mentioned only)

Yalb (mentioned only)

Taravangian (mentioned only)

the Almighty (mentioned only)

Lhanin (mentioned only)

Dandos Heraldin (mentioned only)

Plot summary

Shallan is en route to the Palanaeum, hoping to convince Jasnah that she is worthy to be her ward. She believes that it is critical that she find a way to do so, as without her father, her family can no longer Soulcast its way into wealth or manipulate others into doing as they want.

She is allowed to wait for Jasnah in her reading alcove, though she is denied access to the Palanaeum itself. While she waits, she sketches several Memories from the past few hours, then writes a letter to Jasnah containing arguments for her reconsideration. She is interrupted by an ardent introducing himself as Kabsal. He asks to wait for Jasnah with Shallan and praises her sketches highly.

Kabsal tells Shallan that he is trying to convert Jasnah, an avowed atheist, to Vorinism. He leaves, asking her to let Jasnah know that he had come by to speak with her. She agrees, and begins to lacquer her drawings. She realizes that she's been there for quite a while and begins to gather her things, leaving the letter for Jasnah. Before she can leave, however, Jasnah appears in the doorway, looking displeased.`
  },
  8: {
    title: 'Nearer the Flame',
    pov: 'Shallan Davar',
    text: `Chapter 8: Nearer the Flame

Characters

Shallan Davar (point of view)

Jasnah Kholin

Yalb

Artmyrn

Kabsal (mentioned only)

Lin Davar (mentioned only)

Balat Davar (mentioned only)

Wikim Davar (mentioned only)

Jushu Davar (mentioned only)

Helaran Davar (mentioned only)

Tozbek (mentioned only)

Placini (mentioned only)

Gabrathin (mentioned only)

Yustara (mentioned only)

Manaline (mentioned only)

Shauka-daughter-Hasweth (mentioned only)

Rencalt (mentioned only)

Szeth (mentioned only)

Barmest (mentioned only)

Plot summary

Jasnah scolds Shallan, telling her that she had already made her decision. Shallan is embarrassed that she disturbed Jasnah again and leaves. After only a few moments, however, Jasnah calls her back and apologizes to her and gives her Shallan's money pouch that she had left behind.

Shallan asks Jasnah to read the letter she had written for her earlier. Jasnah is impressed that she is self-taught and agrees to accept Shallan as her ward once she has adequately learned philosophy and history. Shallan is pleased by this, but worries that she cannot learn fast enough to save her house.

Shallan leaves the Conclave and meets up with Yalb, who has been gambling with some guards. Yalb insists that she is talented enough to be accepted if she would just be more persistent, so she decides to buy a bunch of books on history and philosophy and return to start studying right away, planning to impress Jasnah with her rapid learning just before Jasnah leaves Kharbranth. Before long, however, she is interrupted by Jasnah, who had paid the servants to tell her if Shallan returned to the Palanaeum.

Jasnah asks to see Shallan's satchel. When she comes across Shallan's sketches with notes on biology, she asks why she made them, to which Shallan replies that she wanted to. It is ultimately the fact that Shallan pursues scholarship in her free time, along with her persistence, that convince Jasnah to accept her as her ward.

Shallan reflects that now she's completed the first phase of her plan, but now needs to discover how to accomplish the rest of it without being caught.`
  },
  9: {
    title: 'Damnation',
    pov: 'Kaladin',
    text: `Chapter 9: Damnation

Characters

Kaladin (point of view)

Sylphrena

Gaz

Laresh

Torol Sadeas (mentioned only)

Lirin (mentioned only)

Tien (mentioned only)

Cenn (mentioned only)

Plot Summary

Kaladin has now been a member of the bridge crews for somewhere between two to four weeks. Of the twenty five who survived his first bridge run, only one other man is still alive.

A few new arrivals are brought in, and Kaladin sees a young boy who reminds him of his younger brother Tien. In general, Kaladin is handling the transition to life as a bridge crew member poorly, snapping at Syl and becoming despondent. Syl leaves, unable to continue watching him in his current state.

The bridge crews are called on another run, and the boy who reminded him of Tien is killed, as well as the only remaining man from Kaladin's first bridge run. Kaladin thinks to himself that he is dead inside, then proceeds to cry.`
  },
  10: {
    title: 'Stories of Surgeons',
    pov: 'Kaladin',
    timeContext: 'Nine Years Ago',
    text: `Chapter 10: Stories of Surgeons

Characters

Kaladin (point of view)

Lirin

Sani

Hesina (mentioned only)

Hammie (mentioned only)

Tien (mentioned only)

Jam (mentioned only)

Meridas Amaram (mentioned only)

Wistiow (mentioned only)

Gavilar Kholin (mentioned only)

Vathe (mentioned only)

Plot Summary

Kal (his nickname as a boy) helps his father, Lirin, treat a young woman, Sani. He reflects over the course of the surgery on how his family is treated so differently because of his father's career.

When they finish amputating Sani's middle finger, Lirin asks Kaladin why he was late to arrive, and Kaladin replies that he was with a boy named Jam learning to use a quarterstaff. This sparks a debate between Kaladin and Lirin about the relative merits of being a soldier or a surgeon. Lirin meets Kaladin's claim that it's possible to save lives by killing others with the assertion that doing so is like "trying to stop a storm by blowing harder." Eventually, Kaladin simply stops arguing and goes back to cleaning up the room.

Lirin quizzes him on various things a surgeon should know, then tells him that he plans to send him to Kharbranth to train under the surgeons there if he can find a way to do so. Lirin also tells him that he's incredibly gifted when it comes to surgery, and he shouldn't waste himself on soldiering.`
  },
  11: {
    title: 'Droplets',
    pov: 'Kaladin',
    text: `Chapter 11: Droplets

Characters

Kaladin (point of view)

Gaz

Sylphrena

Teft

Lirin (mentioned only)

Tien (mentioned only)

Meridas Amaram (mentioned only)

Plot Summary

Kaladin is outside just after a highstorm, going to the Honor Chasm to commit suicide. Gaz stops him, accusing him of trying to steal spheres left out in the Highstorm from others, but Kaladin simply ignores him and goes.

Just as Kaladin is about to step into the chasm, Syl reappears, carrying a single blackbane leaf which she had brought hoping to make Kaladin happy. When Kaladin expresses his frustrations at his previous failures to protect people, Syl convinces him to try again, arguing that the bridgemen are going to die anyway, so his efforts cannot hurt.

Kaladin returns to the camp and attacks Gaz, throwing him to the ground. He demands that Gaz make him bridgeleader of Bridge Four, and that he give Kaladin full control of it. In return, Gaz receives one fifth of Kaladin's wages.

Kaladin then goes inside the barracks and begins asking the other bridgemen's names, noticing for the first time how pathetic they all are.`
  },
  12: {
    title: 'Unity',
    pov: 'Adolin Kholin, Dalinar Kholin',
    text: `Chapter 12: Unity

Characters

Adolin Kholin (point of view)

Dalinar Kholin (point of view)

Elhokar Kholin

Torol Sadeas

Vamah

Renarin Kholin

Gallant

Vengeance

the Thrill

Tarilar

Vartian

Lomard

Wit

Bashin

Gavilar Kholin (mentioned only)

Janala Lustow (mentioned only)

Honor (mentioned only)

Rilla (mentioned only)

Deeli (mentioned only)

Navani Kholin (mentioned only)

Jasnah Kholin (mentioned only)

Plot summary

Adolin is on a chasmfiend hunt with Dalinar, Renarin, Elhokar, and Sadeas. He is troubled by Dalinar's increasingly strange behavior, especially his fits during the highstorms, and worries that his father is going mad. Sadeas also continually taunts Dalinar over his lack of recent success in capturing gemhearts, which frustrates Adolin.

Meanwhile, Dalinar, riding up by Elhokar and Sadeas, tells Elhokar that if they had a proper vantage point, they could observe the progress of the soldiers crossing the chasms. Elhokar charges off to a nearby rock formation, betting Dalinar five broams that he can beat him there. Dalinar races after him, at first thinking only of Elhokar's safety, but eventually getting into the thrill of the contest. Just as Dalinar is about to win, he remembers the strange voice in his dreams, who he presumes to be the Almighty, telling him to "unite them." He hesitates, and Elhokar beats him to the top. When he sees how thrilled Elhokar is to have beaten him, Dalinar is glad to have waited. They watch the soldiers cross for a few minutes, then begin to return to the others. Adolin watches their return, all the while giving orders for his men to circle around to various plateaus, securing the area.

Dalinar and Elhokar return, and Adolin gives his report to them. Elhokar reluctantly agrees to wait for the rest of the soldiers to cross, setting up a small awning to wait under, and conversing with his courtiers. Adolin questions Dalinar about the purpose and the wisdom of their hunting expedition, particularly where it leaves Elhokar open to a potential Parshendi ambush. Dalinar replies that a victory such as a successful hunt, in a controlled, safe environment, will bolster the king's reputation and increase his self-confidence as well. Just as Adolin begins agreeing with him however, he voices a thought about how the Alethi should be in Alethkar, not on the Shattered Plains. This shocks and upsets Adolin.

After a brief conversation with the King's Wit, in which Wit tells Dalinar that Renarin is not as fragile as he thinks, Dalinar and Adolin meet again with Elhokar and Sadeas, making final preparations for the hunt. After only a few minutes conversing with Bashin, the hunt master, however, Dalinar and Adolin realize that something is wrong. At this point, the chasmfiend they have been hunting appears, climbing onto the platform with all of the courtiers and scribes, rather than the smaller plateau the hunt was supposed to take place on.`
  },
  13: {
    title: 'Ten Heartbeats',
    pov: 'Dalinar Kholin, Adolin Kholin',
    text: `Chapter 13: Ten Heartbeats

Characters

Dalinar Kholin (point of view)

Adolin Kholin (point of view)

Elhokar Kholin

Sureblood

Gallant

Vengeance

Torol Sadeas

Renarin Kholin

Gavilar Kholin (mentioned only)

Plot summary

Dalinar, Adolin, and Elhokar all immediately begin to race for the chasmfiend, hoping to kill it before it can harm any bystanders. Sadeas uses his grandbow, weakening it from a distance while Dalinar and Adolin go for its many legs and Elhokar distracts it. While doing so, however, the strap on Elhokar's saddle breaks, causing him to be thrown to the ground. Just as he is about to be crushed by the chasmfiend, Dalinar hurls himself beneath the descending claw and, with Shardplate-enhanced strength, catches it, giving Elhokar time to escape.

Adolin continues to cut off its legs, and the chasmfiend is eventually unable to support its own weight. Elhokar summons his Shardblade once again and uses it to kill the felled chasmfiend, then harvest its gemheart.`
  },
  14: {
    title: 'Payday',
    pov: 'Kaladin',
    text: `Chapter 14: Payday

Characters

Kaladin (point of view)

Sylphrena

Moash

Dunny

Narm

Sigzil

Leyten

Rock

Gaz

Teft

Meridas Amaram (mentioned only)

Tien (mentioned only)

Plot summary

Kaladin gets up before any of the other bridgemen, resolved that he will fight for a better existence, even in his terrible circumstances. He attempts to rouse the rest of Bridge Four, but none come. After Kaladin physically carries Moash out of the barrack, however, the rest of the bridgemen reluctantly get up. Kaladin then informs the men of bridge four that instead of sleeping in each morning, they will be training, and that he intends to do everything he can to ensure that Bridge Four never loses another man.

The other bridgemen all refuse to participate in Kaladin's training once Gaz informs them that they don't have to. Kaladin goes to Gaz and gets his pay for the week, returning one of his five spheres as a bribe. Gaz tells Kaladin that he has no authority and will be unable to sway the bridgemen, then leaves. Kaladin, worried that Gaz may decide Kaladin is more trouble than he's worth and kill him, asks Syl to watch over him at night and wake him if Gaz tries anything.

Kaladin then proceeds to spend his morning training, jogging back and forth across the lumberyard with an unfinished board of a bridge. He does this for several hours before meeting several of the men from Bridge Four to dismiss them for lunch. Syl informs Kaladin that she is changing, becoming better at remembering things and understanding new concepts and abstract ideas. Kaladin realizes that she feels much the way about her new understanding of life as he does about his current position –- afraid to continue, but sure that he can't go back.`
  },
  15: {
    title: 'The Decoy',
    pov: 'Adolin Kholin, Dalinar Kholin',
    text: `Chapter 15: The Decoy

Characters

Adolin Kholin (point of view)

Dalinar Kholin (point of view)

Torol Sadeas

Elhokar Kholin

Renarin Kholin

Wit

Vamah

Gallant

Dalinar's wife (mentioned only)

Gavilar Kholin (mentioned only)

The Almighty (mentioned only)

Roion (mentioned only)

Talata (mentioned only)

Bethab (mentioned only)

Navani Kholin (mentioned only)

Jasnah Kholin (mentioned only)

Nohadon (mentioned only)

Plot summary

Adolin is overseeing the cleanup four hours after the chasmfiend attack while the group waits for a bridge crew to come, replacing the bridge the chasmfiend had destroyed in its rampage. He reflects that many of the other lighteyes are treating Dalinar slightly more respectfully and carefully after his earlier rescue of Elhokar, and thinks to himself that it can't last. Having finished his rounds, he approaches Elhokar's pavilion to give his final casualty report.

In the pavilion, Elhokar chides Dalinar for not making serious efforts to win gemhearts, comparing him to Sadeas. Eventually, the conversation deteriorates to taunting, until Adolin calls Sadeas a coward. Sadeas in turn calls Renarin useless, nearly sparking a duel and possibly a war then and there, until he retracts his statement. Wit appears and taunts Sadeas for a while before actually praising Renarin's intelligence.

Adolin and Dalinar then go to examine the strap of Elhokar's saddle to see if it could have been cut. Adolin wonders why they're bothering until he realizes that Elhokar believes that the strap was cut as an assassination attempt, at which point he remarks on Elhokar's increasing paranoia. Dalinar tells Adolin to take the strap to a leatherworker to examine, to talk to the grooms about the saddle, and to double the king's guard. Adolin wonders whether Sadeas is behind the cut strap. Dalinar then approaches Highprince Vamah, manipulating him into making greater use of Elhokar's Soulcasters, ensuring continued income for Elhokar.

Sadeas approaches Dalinar to tell him of the success of their manipulation of Vamah, and Adolin realizes that the two of them had planned the entire thing between them. After a brief argument, Adolin and Dalinar leave. Dalinar then tells Adolin that though he hates Sadeas, he's certain that he wouldn't hurt Elhokar. Dalinar reveals that Sadeas was the decoy the night of Gavilar's assassination, attempting to lead Szeth away so Gavilar could escape. He then tells Adolin that Sadeas has sworn to protect Elhokar at any cost, then further discusses Gavilar's assassination and his final words. Elhokar approaches, asking if they've learned anything about the saddle. He and Dalinar then begin arguing, Elhokar insisting that someone is trying to kill him and Dalinar insisting that Elhokar is simply overreacting.

Elhokar leaves, and Dalinar sends Adolin to prepare the soldiers to move. As he begins to make his way back to camp, Dalinar reflects on his failure to determine the meaning of Gavilar's last words and his desire to protect Elhokar.`
  },
  16: {
    title: 'Cocoons',
    pov: 'Kaladin',
    timeContext: 'Seven and a half years ago',
    text: `Chapter 16: Cocoons

Characters

Kaladin (point of view)

Laral

Tien

Jost

Jest

Mord

Tift

Naget

Khav

Lirin

Torol Sadeas (mentioned only)

Meridas Amaram (mentioned only)

Gavilar Kholin (mentioned only)

Hesina (mentioned only)

Dalinar Kholin (mentioned only)

Wistiow (mentioned only)

Plot summary

Kaladin is talking to his friend Laral about his father's plans for him to be a surgeon. Laral encourages him to become a soldier and win a Shardplate and blade for himself. Tien interrupts their conversation and gives Kaladin a rock, intended to make him feel better. Tien and Kaladin then go hunting for lurgs, a type of small, slimy creature.

Kaladin and Laral go to talk to some of the other boys, questioning why they aren't working in the fields like usual. Jost, another boy, claims that his father was cheated out of a Shardblade, but Kaladin insists that the area where his father fought wouldn't have had any Shardbearers, and Jost's father must be remembering wrong. Jost gets angry and challenges Kaladin to fight him.

Kaladin gets in a few good hits, and is surprised by how good the quarterstaff feels in his hands, but he is outmatched by Jost. Tien helps him up, and they return home. There, Kaladin is informed that Brightlord Wistiow, the Citylord and Laral's father, is dead. He left Kaladin a large number of spheres for him to go to Kharbranth, be trained as a surgeon, then return to Hearthstone to serve the people there with his new knowledge.`
  },
  17: {
    title: 'A Bloody Red Sunset',
    pov: 'Kaladin',
    text: `Chapter 17: A Bloody Red Sunset

Characters

Kaladin (point of view)

Syl

Yake

Dunny

Malop

Gaz

Moash

Torol Sadeas

Rock

Drehy

Teft

Leyten

Murk

Adis

Corl

Hobber

Koorm

Gadol

Dabbid

Narm

Hesina (mentioned only)

Lirin (mentioned only)

Meridas Amaram (mentioned only)

Tien (mentioned only)

Lamaril (mentioned only)

Plot Summary

Kaladin visits an apothecary, hoping to get some antiseptic. He is charging considerably more than Kaladin can afford, so he only gets some bandages and sewing materials.

He has only been back in camp for moments when a horn sounds, calling the bridgemen for a bridge run. Though he is exhausted, each time the bridge stops, Kaladin remains standing rather than collapsing to the ground as most bridgemen do. When they reach the final chasm, Kaladin takes Rock's position at the front of the bridge instead of taking his privileged position as bridgeleader toward the back.

All four of the other men in the front row, the deathline, are hit with arrows almost immediately, but Kaladin takes only minor injuries as arrows zip by him. As soon as the bridge is placed, he begins finding bridgemen who were wounded in the approach and treating their wounds. He then has his men carry the wounded back to camp on top of their bridge, removing them when they get to a chasm so the soldiers can cross. Gaz objects to the idea, but Kaladin gives him an extra bribe, a dun sphere that was infused just before the battle.`
  },
  18: {
    title: 'Highprince of War',
    pov: 'Adolin Kholin, Dalinar Kholin',
    text: `Chapter 18: Highprince of War

Characters

Adolin Kholin (point of view)

Dalinar Kholin (point of view)

Yis

Avaran

Janala

Tibon

Marks

Falksi

Teshav Khal

Renarin Kholin

Kadash

Ruthar

Elhokar Kholin

Gavilar Kholin (mentioned only)

Torol Sadeas (mentioned only)

Jasnah Kholin (mentioned only)

Dalinar's wife (mentioned only)

Aladar (mentioned only)

Thanadal (mentioned only)

Hatham (mentioned only)

Vamah (mentioned only)

Plot summary

Adolin is out walking with Janala, the woman he has been courting. He visits the leatherworkers who were inspecting the strap from Elhokar's saddle, and they tell him that the strap was almost certainly cut, but it's possible it was a buckle from the saddle itself that sliced it. A horn is sounded, signalling that a chasmfiend has been spotted close enough for Dalinar's men to attempt to reach it first. Adolin is disappointed when Dalinar elects not to seek it.

Dalinar, meanwhile, is working with several of his scribes in attempting to manipulate the other highprinces into following Elhokar in truth. Teshav, the wife of one of his officers, questions the number of troops Dalinar has set patrolling, and Dalinar instructs her to set more patrolling anyway to combat the increased banditry in the area. Renarin comes to talk to Dalinar, and Dalinar promises him that if he captures a new suit of Shardplate and a Shardblade, they will go to Renarin, to help compensate for his blood weakness and allow him to fight like any other man.

Adolin seeks out Kadash, an ardent, to ask his opinion on Dalinar's dreams during highstorms. Janala leaves him, growing frustrated with his lack of attention. Kadash expresses the opinion that Dalinar is either going insane, or the visions are just particularly vivid products of his own mind.

Dalinar visits Elhokar, making his reports for the day. While there, he asks Elhokar how long he intends to continue the war, and suggests that he consider withdrawing. Elhokar is shocked that Dalinar would even consider an end to the Vengeance Pact. Dalinar eventually backs down, instead saying they need a new approach, a way to win the war instead of simply trying to outlast the Parshendi. Dalinar suggests that Elhokar appoint him Highprince of War, and Elhokar tells him he'll consider it.

Dalinar meets up with Renarin, intending to ride back to their camp. However, before they can get there, they are forced to take shelter in one of their own barracks to avoid a highstorm. They barely make it inside before the storm hits.`
  },
  19: {
    title: 'Starfalls',
    pov: 'Dalinar Kholin',
    text: `Chapter 19: Starfalls

Characters

Dalinar Kholin (point of view)

Taffa

Seeli

the Thrill

Midnight Essence

Honor

Renarin Kholin

Rayse (mentioned only)

Heb (mentioned only)

Torol Sadeas (mentioned only)

Elhokar Kholin (mentioned only)

Harkaylain (mentioned only)

Adolin Kholin (mentioned only)

Plot summary

The moment the storm hits, Dalinar finds that he is no longer in the barracks, but in an unfamiliar barn in the middle of a clear, cool night with only a small girl for company. The girl is terrified of something, and thinks that Dalinar is her father. After a few moments of hushed conversation, a strange creature bursts through one of the walls of the barn and attacks. Dalinar is able to avoid the creature long enough to grab the girl and escape to a nearby house where a woman who thinks he is her husband is waiting for him.

Once in the house, Dalinar has the woman bar the door. Shortly thereafter, however, two more of the strange creatures force their way in, and Dalinar is forced to fight them off using an iron poker from the hearth. When he kills them, he notices that rather than bleeding, their wounds seem to release smoke of some sort.

Dalinar takes the woman, Taffa, and the girl, Seeli, to try to escape the creatures by moving along the course of a river. He deflects all of the woman's questions about why he doesn't remember them or their surroundings at all by saying that he hit his head in the fight. Before they can arrive at the river, however, the group is attacked by more of the strange creatures. Just as Dalinar is about to be killed, two Knights Radiant appear and help him to kill the creatures. They tell him that the creatures aren't Voidbringers, but rather Midnight Essence. They invite Dalinar to Urithiru to train as a Radiant, then leave to help others.

Taffa begins to speak to Dalinar, but it isn't her voice. Dalinar recognizes her voice as the same voice he's heard in his previous visions, the one he suspects belongs to The Almighty. The voice tells him to "Unite them," and offers cryptic advice, telling Dalinar that it can't be of much help. Dalinar asks the voice if he should continue to trust Sadeas, and is told yes.

Dalinar continues to question the voice, but before he can receive answers, he wakes up back in the barrack on the shattered plains, surrounded by soldiers who have been holding him down, keeping him from acting out his visions. He tells them that his mind is clear and they can release him, then takes Renarin and leaves.`
  },
  20: {
    title: 'Scarlet',
    pov: 'Kaladin',
    timeContext: 'Seven years Ago',
    text: `Chapter 20: Scarlet

Characters

Kaladin (point of view)

Miasal

Harl

Valama

Lirin

Wistiow (mentioned only)

Laral Roshone (mentioned only)

Alim (mentioned only)

Plot Summary

Kaladin is performing an unexpected surgery on a girl from his village. He had fortunately been nearby when the girl was injured. He begins working to stop her bleeding. After a short time, he succeeds in stopping the bleeding, but realizes that his success was not due to his treatment but rather because the girl has died.

He leaves her father to grieve over her, trying to cope with the fact that he was unable to save her. His father finds him and tells him that his work had all been good, and her death wasn't Kaladin's fault. He leaves Kaladin, telling him that he'll have to learn when to care and when to let go.`
  },
  21: {
    title: 'Why Men Lie',
    pov: 'Kaladin',
    text: `Chapter 21: Why Men Lie

Characters

Kaladin (point of view)

Leyten

Hobber

Dabbid

Syl

Rock

Teft

Gaz

Sigzil

Peet

Koolf

Moash

Bussik

Gaz (mentioned only)

Hav (mentioned only)

Lirin (mentioned only)

Torol Sadeas (mentioned only)

Dalinar Kholin (mentioned only)

Meridas Amaram (mentioned only)

Lamaril (mentioned only)

Plot Summary

Kaladin lies in bed, debating whether or not to get up. Eventually, he forces himself up and realizes that the other bridgemen had all been watching to see if he would get up and continue his training routine from the previous day. Kaladin goes to check on the wounded from the previous day's bridge run. Two of them are, for the most part fine, but one of them badly needs antiseptic.

Kaladin washes the man's wounds with water, then goes out to perform his morning training routine. While jogging with his plank, he talks to Syl. She tells him that some of his men think he's gone mad, and asks him why men lie. Kaladin is unable to give her an answer. Syl claims that the king's uncle doesn't lie, but Kaladin cynically remarks that if someone has lighteyes, they lie.

Gaz approaches and tells Kaladin that Sadeas has ordered that his wounded men not receive food or pay for the duration of the time they can't run bridges. Kaladin is furious, as this means that he'll have to find another way to care for them.

Kaladin goes to the men of Bridge Four and asks them to split their food with the wounded and to contribute their pay for medical supplies. Most laugh at him and leave, but Rock agrees to share some of his food with Hobber, the man who he feels has the best chance of recovering, because he feels he owes Kaladin for running the deathline in his place the previous day. Rock also says that he can see Syl, though she hasn't specifically revealed herself to him.

Kaladin then goes to Gaz and gets his bridge crew assigned to stone-gathering duty for the day. He convinces Rock and Teft to help him gather knobweed reeds over the course of the afternoon.`
  },
  22: {
    title: 'Eyes, Hands, or Spheres',
    pov: 'Dalinar Kholin',
    text: `Chapter 22: Eyes, Hands, or Spheres

Characters

Dalinar Kholin (point of view)

Adolin Kholin

Elhokar Kholin

Renarin Kholin

Wit

Marakal

Cadilar

Taselin

Habatab

Tumul

Yonatan

Meirav

Navani Kholin

Roion

Torol Sadeas

Aona (mentioned only)

Skai (mentioned only)

Rayse (mentioned only)

Jasnah Kholin (mentioned only)

Plot summary

Dalinar goes with his sons to the king's feast. Adolin reports that according to the leatherworkers he consulted, the strap was cut, though it could've been an accident. They discuss the king's paranoia and Dalinar refuses to talk about his episode in the highstorm, saying that perhaps it was good for the men in the barracks to witness it, as the rumors about his condition were perhaps worse than the truth.

Dalinar chafes at the sloppy popular fashion sense of the other nobles and the fact that their drunkenness is in violation of the Alethi War Codes. The king's Wit sits on a stool at the entrance to the island and insults everyone as they go to the feast. He warns Dalinar that the rumor has spread of his suggestion to the king that they retreat and abandon the Vengeance Pact. Lady Navani, Gavilar's widow, unexpectedly shows up to the feast, having just arrived to the Shattered Plains. Dalinar tries to hide his attraction to her with the utmost propriety, addressing her as a sister.

King Elhokar then announces that in light of the recent attempt on his life with the cut girth strap, he is appointing Sadeas to Highprince of Information to investigate. This is to snub Dalinar, who he believes is not giving the investigation serious attention. Dalinar realizes that this is Sadeas's way of outmaneuvering his Highprince of War idea.`
  },
  23: {
    title: 'Many Uses',
    pov: 'Kaladin',
    text: `Chapter 23: Many Uses

Characters

Kaladin (point of view)

Rock

Teft

Syl

Dunny

Jaks

Natam

Skar

Leyten (mentioned only)

Torol Sadeas (mentioned only)

Gaz (mentioned only)

Wistiow (mentioned only)

Toralin Roshone (mentioned only)

Meridas Amaram (mentioned only)

Rayse (mentioned only)

Bavadin (mentioned only)

Plot Summary

Bridge Four is on rock duty, finding stones to Soulcast into food. Kaladin has Rock and Teft searching for knobweed to extract the antiseptic sap from. Rock, who can inexplicably see Syl, finds knobweed quickly guided by her. Kaladin ties bundles of the reed to the bottom of the cart to conceal them. Syl comes to him excitedly, telling him that she led Rock to a pile of dung as a joke. He makes small talk with the bridgecrew, trying to soften their attitude towards him, with little success. Kaladin realizes that even though he has saved lives in Bridge 4, no one will follow his leadership unless he finds a way to make their lives worth living.

Later, Kaladin, Rock, and Teft sneak into the wagonyard to retrieve the knobweed. Relieved that it's still there and not too dried out, they head to where Syl found the chipped, discarded liquor bottles to use for the knobweed sap. They then head to the Honor Chasm to squeeze the sap into the bottles.

While working, they talk. Teft asks Kaladin why he tries to lead the bridgecrew. Kaladin says that the responsibilities of the bridgeleader are his to decide. Kaladin asks Rock how he came to be a bridgeman. Rock tells him that his leader, or nuatoma, dueled Highprince Sadeas to try to win his Shardplate. When he lost, Rock, his cousin and servant, was bound to Sadeas. He was a cook, until he snuck chull dung into Sadeas's food, which caused his fall to bridgeman status. Teft asks Kaladin for his story explaining why he is a bridgeman. Kaladin says that he killed a man, though it wasn't murder and he was thanked by someone important. He cryptically says that he is a bridgeman because a lighteyes did not take it well when he turned down a gift.`
  },
  24: {
    title: 'The Gallery of Maps',
    pov: 'Dalinar Kholin, Adolin Kholin',
    text: `Chapter 24: The Gallery of Maps

Characters

Dalinar Kholin (point of view)

Adolin Kholin (point of view)

Roion

Torol Sadeas (mentioned only)

Sunmaker (mentioned only)

Gavilar Kholin (mentioned only)

Nohadon (mentioned only)

Janala (mentioned only)

Seveks (mentioned only)

Malasha (mentioned only)

Elhokar (mentioned only)

Renarin (mentioned only)

Plot Summary

Dalinar stands in the king's Gallery of Maps, waiting for Highprince Roion to come and meet him. Dalinar's ultimate goal is to follow his visions by uniting the highprinces, and he thinks he can start by working with another prince on a joint plateau assault. Since Roion has won the fewest gemhearts of all the princes, Dalinar tries to convince him that working together would be more effective. Roion is suspicious of this because he is afraid Dalinar will take any gemhearts and shards for himself. Dalinar compromises, saying that they will split gemhearts and that the first set of plate can go to Roion. Roion rebuffs this offer, instead insinuating that Dalinar is growing weak and deluded by his lapses from sanity during highstorms. Roion says he'll think about a joint assault and leaves.

A few minutes later, as Dalinar is thinking about how to discover what Gavilar's last words really meant, Adolin meets Dalinar. He asks him how the meeting went and when Dalinar tells him that it went poorly, Adolin tells him that Sadeas is asking for permission to enter their warcamp to investigate the threat to the king. Adolin is worried that he may create false evidence framing Dalinar, but Dalinar tells Adolin to allow him to because his vision said to trust Sadeas. At this, Adolin becomes irate, telling Dalinar that to stake the future of their house on hallucinations is folly. Adolin shouts at Dalinar that his visions are just figments of his imagination. Dalinar tells Adolin to leave.`
  },
  25: {
    title: 'The Butcher',
    pov: 'Kaladin',
    timeContext: 'Seven years ago',
    text: `Chapter 25: The Butcher

Characters

Kaladin (point of view)

Terith

Relina

Hesina

Lirin

Tien

Roshone

Wistiow (mentioned only)

Laral (mentioned only)

Miliv (mentioned only)

Gavilar Kholin (mentioned only)

Torol Sadeas (mentioned only)

Plot Summary

Kal overhears some villagers speaking poorly of his father's work, accusing him of stealing the spheres and suspicious of how Lirin can write. Kal meets with his mother, Hesina, who tells him not to hate the villagers for repeating what they have heard. They respect Lirin but are intimidated by his status as second nahn. Kal realizes his parents had hoped to marry him off to Laral. He can't decide if he wants to be a soldier or a surgeon.

The new citylord, Brightlord Roshone, arrives. He is less than pleased to be in a backwater city. He blames Lirin for his predicament because Lirin let Wistiow die. Lirin and Hesina don't know if things are better or worse for them with this new citylord.`
  },
  26: {
    title: 'Stillness',
    pov: 'Dalinar Kholin',
    text: `Chapter 26: Stillness

Characters

Dalinar Kholin (point of view)

Renarin Kholin

Teleb

Kalami

The Thrill

Perethom

Havarah

Adolin Kholin

Malasha

Ilamar

Moratel

Torol Sadeas

Gallant

Sureblood

Litima (mentioned only)

Nohadon (mentioned only)

Isasik Shulin (mentioned only)

Jasnah Kholin (mentioned only)

Aladar (mentioned only)

Roion (mentioned only)

Ashelem (mentioned only)

Plot summary

Brightness Litima reads the The Way of Kings to Dalinar. Renarin is with him. Listening usually comforts Dalinar, but not this time. It reminds him of Adolin's arguments. Dalinar is disturbed by the nature of his visions. Dalinar tells Renarin that Highprince Aladar refused his offer of an alliance, just as Roion did. Horns sounds outside. Dalinar enters the war room and gives Teleb an order to march. Teleb presses Dalinar on the idea of using faster bridges carried by men, and he finally relents and gives Teleb permission to recruit and train one crew. Sadeas comes to interview Dalinar's soldiers. He is insistent that the investigation continue despite the imminent battle, so he follows Dalinar and his army. Dalinar and Sadeas talk about the Thrill. Usually men don't speak about it.

Dalinar summons Oathbringer and together with Adolin they attack the Parshendi. The Thrill gives him strength, focus, and power until he feels a sudden stab of powerful revulsion to the scene of death around him. He forces himself to continue to fight but feels sick. Dalinar hears a voice saying "Life before death," but nobody is near enough. He starts to fight for his men.

Dalinar wins the battle and Adolin takes the gemheart. Dalinar is looking eastward, toward the Origin, when he notices a group of Parshendi on a nearby plateau. Among them is a large Parshendi wearing Shardplate. Dalinar wonders why the Shardbearer hadn't participated in the battle. The group flees toward their base at the center of the Plains.`
  },
  27: {
    title: 'Chasm Duty',
    pov: 'Kaladin',
    text: `Chapter 27: Chasm Duty

Characters

Kaladin (point of view)

Teft

Rock

Gaz

Syl

Dunny

Skar

Moash

Sigzil

Peet

Yake

Maps

Narm

Drehy

Jaks

Torfin

Hobber

Leyten (mentioned only)

Dabbid (mentioned only)

Lirin (mentioned only)

Tien (mentioned only)

Torol Sadeas (mentioned only)

Tukks (mentioned only)

Hesina (mentioned only)

Jezrien (mentioned only)

Nale (mentioned only)

Plot Summary

Kaladin visits the apothecary again to sell his knobweed sap. The apothecary pretends that "wild" knobweed isn't as effective and tries to swindle Kaladin. With the help of Syl, he sees through the ruse and gets a better price. He considers escaping, but he can't bring himself to leave the bridgemen. Gaz has changed Bridge Four's work duty to chasm duty because the other bridges resent them for getting away with breaking rules by bringing back wounded.

Down in the chasms they have to look for corpses to get their equipment and whatever else can be found. Kaladin, Teft and Rock walk ahead talking. They find Dunny listening, try to make him participate, and it works. As the tension eases, they discover that Dunny can sing. The other crew members still remain aloof.

Eventually they find a lot of corpses and begin their morbid work. Kaladin picks up a spear and gets overwhelmed by his memories. At first, most of the others jeer him for pretending to be their leader, but after he finishes his kata, they stare in amazement. Remembering that they have work to do or they'll get in trouble, he drops the spear and tells them to get to work. Teft is clearly impressed, but Kaladin down plays the issue.

Later, Syl looks with Rock and Dunny for more corpses and they find Parshendi. They discover that the Parshendi's armor is grown from their bodies.

The crew finishes their chasm duty and goes back to the ladders. Kaladin muses how to get the crew together and comes up with an idea. Back at the barracks he and Rock buy a cauldron and supplies and Rock cooks an evening stew for all the men of Bridge Four. One by one they all eventually come out of the barrack and sit around the fire, eating Rock's stew.

The next morning, many more members of Kaladin's crew get up early to work out.`
  },
  28: {
    title: 'Decision',
    pov: 'Adolin Kholin, Dalinar Kholin',
    text: `Chapter 28: Decision

Characters

Adolin Kholin (point of view)

Dalinar Kholin (point of view)

Teleb

Ladent

Havrom

Tadet

Niter

Navani Kholin

Danlan Morakotha

Jasnah Kholin

Kalana (mentioned only)

The Thrill (mentioned only)

Torol Sadeas (mentioned only)

Elhokar (mentioned only)

Thanadal (mentioned only)

Hatham (mentioned only)

Bethab (mentioned only)

Brightlord Morakotha (mentioned only)

Gavilar Kholin (mentioned only)

Lalai (mentioned only)

Shallan Davar (mentioned only)

Plot summary

While on an inspection Adolin studies his father and worries about what he sees. Teleb demonstrates a prototype of a new portable bridge which fails. Adolin encourages him to continue working on the design. As they move off to start inspections, Dalinar wonders why there are no Shards for ordinary people and asks Adolin if he feels the Thrill. On their way to the fifth Battalion, Adolin praises his father's decision to allow the soldiers to bring their families to the Shattered Plains. Dalinar muses about the political and economic impact of the continual harvesting of gemstones and de facto colonization of the Shattered Plains. He tells Adolin that soon he will have to consider this.

After inspecting the 5th Battalion, Havrom leads them to the ten soldiers that were questioned by Sadeas. Dalinar pointedly delegates the interrogation to Adolin. It becomes clear that the grooms' loyalty to Dalinar probably made the situation worse -- they only offered blanket denials to Sadeas. Dalinar asks Tadet to interview the men separately and find out specifics.

Adolin then questions why Dalinar keeps giving him the lead. Dalinar tells him that he has a decision to make, but before he can elaborate, he notices a messenger in Thanadal's colors. The messenger informs Dalinar that Thanadal has to cancel their meeting. Dalinar presses the messenger, and he says he is instructed to say that Thanadal does not wish to do a joint plateau assault with him. All eight highprinces have refused his offer, leaving only Sadeas. He tells Adolin to continue the inspection without him, making a vague excuse about something that needs to be done.

Dalinar is confident that his son will do well as highprince as he tries to decide whether he should abdicate. He orders Niter to bring him his war hammer, then orders some workers out of the new latrine pit. He uses the hammer to work on the latrine himself so he can think through his decision. He worries about how he is losing his thirst for battle and how the book, the Codes, and the Visions have changed him and how the others are regarding him and by extension his sons. As he gets to the end of his work, he feels that he is close to a decision. He is interrupted by Navani. She reminds him that he had an appointment with her. He continues to work, and she eventually gets him to apologize. She tells him that Jasnah's Spanreed is flashing. He quits work on the latrine and they go to take the "call."

As they walk to the viewing room, she hints at starting a relationship, but Dalinar refuses, holding to the tradition that a widowed sister-in-law is a sister in truth. Dalinar is surprised to find Adolin, along with his clerks and their attendants, also already in his sitting chamber. Adolin introduces his new love interest and clerk Danlan Morakotha. He and Jasnah have a short exchange about their family, then Jasnah asks him to repeat his first encounter with the Parshendi, seven years ago.

She also wants to know when he first saw Shardblades in their possession. He replies that he only saw them after Gavilar's death. She then has her new ward (Shallan) draw what is referred to in a book as a Voidbringer, although she doesn't believe it to be one. Dalinar and Adolin identify it as a chasmfiend. Dalinar urges Jasnah to come back to the Shattered Plains as soon as possible. The conversation ends, and he finds himself alone with Navani. He reveals that he is going to abdicate. She believes that to be a big mistake.`
  },
  29: {
    title: 'Errorgance',
    pov: 'Shallan Davar',
    text: `Chapter 29: Errorgance

Characters

Shallan Davar (point of view)

Jasnah Kholin

Eylita Tavinar

Balat Davar

Jushu Davar

Wikim Davar

Taravangian

Masly (mentioned only)

Coldwin (mentioned only)

Hasavah (mentioned only)

Luesh (mentioned only)

Lin Davar (mentioned only)

Hanavanar (mentioned only)

Mederia (mentioned only)

Gavilar Kholin (mentioned only)

Szeth (mentioned only)

Sadees (mentioned only)

Gavarah (mentioned only)

Gregorh (mentioned only)

Varas (mentioned only)

The Almighty (mentioned only)

Dalinar Kholin (mentioned only)

Plot summary

Shallan is talking to her brothers and Balat Davar's betrothed, Eylita Tavinar, over spanreed in her quarters, discussing how to get to Jasnah's Soulcaster. She considers how difficult it will be for her not to fall in love with the freedom and the studying, when Balat informs her, after having sent his brothers out, that Luesh has died. He also tells her that some "friends" of their fathers came by some weeks later "suggesting" Balat should return the Soulcaster. Balat believes that they are the owners of the Soulcaster and are very dangerous. Balat has Eylita draw a picture of a symbol found on a pendant worn by Luesh; he also mentions that one of the "friends" had the same pattern tattooed on his thumb. The conversation ends, and Shallan burns the transcript in the sitting room's fireplace before heading back to her studies.

Five hours later while studying the Alethi monarchy, Shallan tells Jasnah that she thinks the authors are "errorgant". Jasnah informs her that this is the "Assuredness Movement" in which the authors overstated their cases. Shallan wonders why she is researching events as recent as the murder of King Gavilar, to which Jasnah replies that she thought to ease Shallan into true scholarship this way. The discussion moves on to Shallan's habit of saying the first passable clever thing that comes into her mind, speaking of the incompetence of her former tutors and their punishments. Jasnah believes Wit would find her amusing. They move on and talk about what Shallan has learned about Gavilar's murder, and later about youth and scholarship. Shallan wonders at the nature of Jasnah's closely guarded work.

Two hours later Taravangian comes to their balcony joining them at lunch. After Jasnah breaks the silence with a question about his granddaughter, Taravangian asks about Jasnah's Soulcaster, but Jasnah evades the question. He then asks Shallan if she could do a drawing of him, which he intends as a gift for his granddaughter. While Shallan is drawing, Taravangian and Jasnah discuss the Almighty, Jasnah's lack of faith, and the concept of right and wrong. When inspecting her finished picture Shallan realizes that she has drawn some creatures with symbols as heads (Cryptics). She hurriedly crumples the page and claims to have made a mistake. She offers to do a new one for the King by the end of the day. After the King has left, Jasnah and Shallan have a talk about him, during which Jasnah expresses a tentative openness to the possibility that she might join a Devotary at some point. The two continue the discussion about faith for a short while before Jasnah tells Shallan to get on with her sketch for the King.`
  },
  30: {
    title: 'Darkness Unseen',
    pov: 'Kaladin, Gaz',
    text: `Chapter 30: Darkness Unseen

Characters

Kaladin (point of view)

Gaz (point of view)

Lamaril

Skar

Syl

Rock

Teft

Moash

Bisig (mentioned only)

Torol Sadeas (mentioned only)

Amark (mentioned only)

Koolf (mentioned only)

Narm (mentioned only)

Peet (mentioned only)

Stormfather (mentioned only)

Plot Summary

Kaladin leaves the barracks with the first light of the day in rather good spirits, as he is followed by all twenty nine members of Bridge Four. He thinks that the last holdout Bisig might have been bullied by Teft and Rock but chooses to ignore it. Kaladin has the bridgemen do exercises from his military days, stretches and jumping motion for warm up. Several carpenters and soldiers are watching and laughing at them. Kaladin notices Gaz before deciding that there's still some time before breakfast to practice hauling the bridge.

Gaz is contemplating on the loss of his eye and what the ensuing darkness could be hiding, when Lamaril calls him over, to pay his bribe. Gaz only has half of it, one topaz mark, but Lamaril is more interested in Kaladin, noting him as a problem for Gaz. Gaz is unsettled by Bridge Four's training and wonders if Kaladin really did train in the military. Gaz and Lamaril discuss the use of Bridgemen and that Kaladin could become more dangerous. Gaz offers to kill him, but worries about the loss of Kaladin's bribes. Lamaril tells him not to because that would just make the young Bridgeleader into a martyr. He wants Kaladin to fall on a run. Before leaving he threatens Gaz with making him a bridgeman himself. Gaz worries that if Kaladin does get killed, he, Gaz might still end up a bridgeman for not being able to pay off his debt to Lamaril.

Kaladin and Bridge Four are practicing setting the bridge down from a raised position and Kaladin is wondering what it would take for them to practice on a real chasm. He is surprised how good they are considering they have only been training for two weeks. As he sends his team for a break he considers that the last two weeks were in part lucky since they had only two runs and on one they were late. On the other one they "only" lost two men, Amark and Koolf, and only had two wounded, Narm and Peet, but he worries that they only have twenty-five members who can carry since five are wounded in all. Syl joins him telling him that she saw Gaz and Lamaril talking and didn't like the look of them, though she didn't hear what was being said. Considering his men's protection, Kaladin is studying a half finished bridge thinking about using it as a shield. He tells Teft, Rock, Skar and Moash about using a "side carry." It's very awkward to carry that way, so they ask him why they should try it. He doesn't reveal his shield idea but instead tells them it's so they can use different muscles. Before leaving, Moash wants to know why Kaladin made him a squad leader. After Kaladin tells him it's because he's strong-willed, he tells Kaladin that he doesn't trust or like him but is obeying because he's curious what will happen.

Gaz is stunned as he sees Bridge Four do the "side carry." He waves Kaladin over and demands an explanation. Kaladin gives him the excuse about utilizing different muscles. Gaz realizes that this might get Kaladin killed on an actual assault and suggests that they should try it on a run.`
  },
  31: {
    title: 'Beneath the Skin',
    pov: 'Kaladin',
    timeContext: 'Six years ago',
    text: `Chapter 31: Beneath the Skin

Characters

Kaladin (point of view)

Lirin

Luten

Horl

Balsas

Hesina (mentioned only)

Laral Roshone (mentioned only)

Toralin Roshone (mentioned only)

Wistiow (mentioned only)

Tien (mentioned only)

Ral (mentioned only)

Plot Summary

A drunken Lirin tells Kal not to come back to Hearthstone after his studies at Kharbranth. Kal wonders if the reason that the people mistrust Lirin was because he looked under people's skin as a profession. He is angry that at a word from Roshone, people stopped giving donations to their family. Kal suggests they should spend the spheres, but his father is against it. He and Hesina even tried to get Kal accepted for an early admission, but the surgeons at Kharbranth refused. Lirin and Kal talk about the difference between Roshone and Wistiow. After that Kal gets back to his studies. He pulls a rock out of his pocket and thinks of Tien. Tien has been learning carpentry from Ral since he won't be able to learn surgery -- he can't stand the sight of blood. As Kal's thoughts wander to becoming a spearman, he is interrupted by banging on the door. It turns out to be a mob of villagers including Luten, Horl and Balsas, demanding the spheres that Lirin has stolen. Lirin confronts them, daring them to rob and attack him. The villagers melt away into the darkness outside.`
  },
  32: {
    title: 'Side Carry',
    pov: 'Kaladin',
    text: `Chapter 32: Side Carry

Characters

Kaladin (point of view)

Syl

Rock

Gaz

Lamaril

Lopen

Leyten

Dabbid

Hobber

Torol Sadeas

Teft

Natam

Moash

Tien (mentioned only)

Tukks (mentioned only)

Plot Summary

Lopen joins Bridge Four. He and Dabbid bring a water cart for the first time. Near the final assault, Kaladin sees that the Parshendi are already set up. He realizes that if they lose a couple more men, the bridge could topple and crush the entire crew. Kaladin orders Bridge Four to do the side-carry technique to prevent them from being killed.

Bridge Four succeeds and none of them die, however Kaladin realizes that he undermined the entire assault. Most of the other bridges fell, either due to the concentrated fire from the Parshendi or their unpracticed attempts at emulating Bridge Four. Only a few bridges land, and when they do they are scattered. Sadeas's forces are separated from each other and are forced to retreat.

Lamaril and Gaz show up with some men, ready to execute Kaladin on the spot. Kaladin instead convinces them he will be needed alive, to convince Sadeas that it wasn't their idea. Lamaril orders that Kaladin be beaten as Bridge Four watches. His dun spheres are scattered from a kick to his belt pouch.`
  },
  33: {
    title: 'Cymatics',
    pov: 'Shallan Davar',
    text: `Chapter 33: Cymatics

Characters

Shallan Davar (point of view)

Kabsal

Jasnah Kholin

Talatin (mentioned only)

Guvlow (mentioned only)

Myalmr (mentioned only)

Lin Davar (mentioned only)

Balat Davar (mentioned only)

Wikim Davar (mentioned only)

Jushu Davar (mentioned only)

Gavilar Kholin (mentioned only)

Habsant (mentioned only)

Plot summary

Shallan is thinking about how she sometimes gets distracted by the enormity of the Palanaeum. Along with a Parshman servant, she is on her way to get a copy of Dialogues, though she now has an hour each day to do her own research. She has decided on natural science. She thinks about how she could fill gaps in her understanding and has to remind herself that her true goal is to steal Jasnah's Soulcaster. Hiding in one of the library rooms, she goes through some of the sketches she has of Jasnah soulcasting and hopes that with it she will be able to create the mineral deposits to save her family. Comparing her expectation of Jasnah the heretic and the real one, Shallan worries that she might not be able to actually do it. She speculates about talking to Jasnah about the use of a Soulcaster but is startled by a light and decides to get back to her task. She realizes that she's in the room where she can find Shadows Remembered. She was surprised to find that it contained children's stories.

When Shallan returns to the alcove, she finds that Jasnah has not yet returned, but to her surprise Kabsal is present. Apparently he wants to show something to Jasnah, but has some bread and simberry jam to share with Shallan. After a discussion about the meaning of the jam and Shallan's personality, they move on to Shallan's appearance and what she thinks of herself. They also discuss Jasnah's heresy. Shallan considers Kabsal in a romantic light for a short time before dismissing it. Kabsal tries to get Shallan to switch Devotaries even though it is apparently frowned upon to recruit. Kabsal intended to show Jasnah proof of the Almighty, which Shallan is curious to see. He gets out a book where he shows her four patterns of the cities Kholinar, Vedenar, Thaylen City, and Akinah. Using a metal plate with sand and a bow, he recreates the patterns in the sand through the resonance, telling her that this is called Cymatics. Telling her of more examples he considers proof, he guides the conversation to saving her soul. When Jasnah appears she is not surprised to see Kabsal but not pleased either. She reveals that she knows about Cymatics but doesn't seem impressed by it. After Kabsal is gone, Jasnah warns Shallan that Kabsal is only interested in Shallan to get to Jasnah and her soulcaster.`
  },
  34: {
    title: 'Stormwall',
    pov: 'Kaladin',
    text: `Chapter 34: Stormwall

Characters

Kaladin (point of view)

Syl

Rock

Teft

Moash

Lirin (mentioned only)

Lamaril (mentioned only)

Torol Sadeas (mentioned only)

Gaz (mentioned only)

Stormfather (mentioned only)

Hesina (mentioned only)

Plot Summary

Kaladin gains consciousness to find himself tied upside down by his ankles outside the barrack. Syl tells him that Lamaril was executed and Gaz was left in his position. Kaladin is to be judged by the Stormfather -- left out in the highstorm to see if he will survive. Syl leaves and comes back with Rock, Teft and Moash. They tell Kaladin about the disaster caused by the side carry of Bridge Four. They say that Bridge Four will remember Kaladin for what he had done, and that they will not go back to how they were before. Kaladin, just a bit light in the head after being beaten and hung up upside down, tells them he will survive. Though there is a very little chance of surviving a highstorm outside, they want to believe him. Finally Teft gives him a dun sphere as a kind of lucky charm before the three retreat to the barracks. The stormwall arrives.`
  },
  35: {
    title: 'A Light By Which to See',
    pov: 'Kaladin, Teft',
    text: `Chapter 35: A Light By Which to See

Characters

Kaladin (point of view)

Teft (point of view)

Syl

Stormfather

Rock

Torol Sadeas (mentioned only)

Plot Summary

The stormwall hits Kaladin, flings him around, presses him against the side of the barrack. When he screams, the coldness of the storm courses into his mouth. He clutches the sphere as if his life depends on it. Syl stays by his side and tells him to grab the roof. He does and comes to lay on the roof. For more grip he snatches the ring where his ropes are tied to and fights against being cast down by the highstorm, always clutching the sphere. In some brief moments he sees Syl standing before him as if trying to hold back the storm. His grip grows numb and he's flung about again. He sees a brief vision of an enormous face. Kaladin feels a deep chill running through his body. He looks at the sphere now glowing brightly. He falls unconscious.

After the highstorm subsides, Rock leaves the barracks, followed by Teft. Though they had wanted to believe that Kaladin could survive the highstorm, they didn't expect it. They find Kaladin, his body in terrible shape. His eyes snap open. The bridgemen gasp and fall to the ground in shock. Rock yells for the others to help get him down. Teft sees Kaladin dropping the sphere. It is dun.`
  },
  36: {
    title: 'The Lesson',
    pov: 'Shallan Davar',
    text: `Chapter 36: The Lesson

Characters

Shallan Davar (point of view)

Jasnah Kholin

Gavilar Kholin (mentioned only)

Taravangian (mentioned only)

Plot summary

Shallan almost steals Jasnah's Soulcaster while serving as her bathing attendant, but can't do it. Jasnah decides to teach Shallan philosophy hands-on by taking a walk at night in a dangerous part of town. When attacked by murderers, Jasnah Soulcasts one of the men to fire. As the frightened attackers leave, Jasnah Soulcasts another to crystal and uses Stormlight lightning to kill the last two. After returning to their rooms, a shaken Shallan decides that Jasnah doesn't deserve to use a holy thing like the Soulcaster and swaps it out with her broken Soulcaster.`
  },
  37: {
    title: 'Sides',
    pov: 'Kaladin',
    timeContext: 'Five and a half years ago',
    text: `Chapter 37: Sides

Characters

Kaladin (point of view)

Tien

Hesina

Lirin

Natir

Toralin Roshone

Barm

Rillir Roshone

Laral Roshone

Mabrow Pigherder (mentioned only)

Wistiow (mentioned only)

Miliv (mentioned only)

Torol Sadeas (mentioned only)

Plot Summary

Kal helps his mother with the cooking as Tien shows off another pretty stone he has found. Kal immediately leaves when he sees a carriage from Roshone come to pick up his father. He insists on coming along. Lirin is surprised because Kal shouldn't have known about it but lets him join. This meeting is about the spheres that Lirin got from the former citylord Wistiow. Lirin and Kal sit down to eat with Roshone, but Lirin refuses to eat. He and Roshone argue about the spheres, Roshone offering a settlement: he takes nine-tenths, leaving the rest to Lirin. Kaladin is indignant and is dismissed from the table by his father. Kal goes to the kitchen and meets Laral and Roshone's son Rillir. He treats Kal like a servant and Laral plays along initially. When Kaladin refuses to serve him, he continues to taunt him. Laral pleads with him to stop, and they leave. His experience with the haughty lighteyes has changed his mind again: he wants to be a surgeon, not a soldier.

While on the way home Lirin tells Kal that he made Roshone believe that he probably will bend on the topic of these spheres. Kaladin realizes that it's a tactic designed to make him focus on a deal rather than proving the truth -- that the spheres really were stolen. Kaladin is shocked to belong to a family of thieves. Lirin justifies it by saying that Wistiow would have given him the spheres anyway. Kal makes another decision that night: he starts going with his full name "Kaladin," for it is a man's name.`
  },
  38: {
    title: 'Envisager',
    pov: 'Kaladin, Teft',
    text: `Chapter 38: Envisager

Characters

Kaladin (point of view)

Teft (point of view)

Syl

Skar

Gashash-son-Navammis (mentioned only)

Lirin (mentioned only)

Torol Sadeas (mentioned only)

Tien (mentioned only)

Goshel (mentioned only)

Dallet (mentioned only)

Lamaril (mentioned only)

Leyten (mentioned only)

Stormfather (mentioned only)

Gaz (mentioned only)

Plot Summary

Kaladin lies in Bridge Four's barrack, suffering fever from the wounds he got being strung up in the highstorm. Most of the time he's unconscious. In his rare lucid moments he sees deathspren, and Syl, a small figure of pure white light holding a sword made of light. She fights the deathspren with her sword and wards them off. Kaladin just wants to relax and die, but he fights to survive because he doesn't want to fail Bridge Four like he did Tien, Dallet, and others. He notices more deathspren each time he is lucid enough to see them.

Skar watches over Kaladin. They keep a guard on him at all times to keep away prying eyes and possible assassination attempts. Teft comes to relieve him to test a theory, a belief he once rejected as a child of Envisagers. He puts three diamond spheres into Kaladin's hand, then waits. When he nearly thinks that he wasn't right, Kaladin gasps, breathing in Stormlight. Teft sees Stormlight rising from Kaladin's body, knitting some of the wounds. The Stormlight is depleted quickly, but Kaladin seems more relaxed than before with more color to his skin. Teft curses Kaladin for revealing the truth to him now, in this place. He knows that Kaladin can heal, but he has to do it carefully, a little at a time, to conceal what is happening.`
  },
  39: {
    title: 'Burned Into Her',
    pov: 'Shallan Davar',
    text: `Chapter 39: Burned Into Her

Characters

Shallan Davar (point of view)

Balat Davar

Eylita Tavinar

Alezarv (mentioned only)

Calinam (mentioned only)

Jasnah Kholin (mentioned only)

Taravangian (mentioned only)

Sur Kamar (mentioned only)

Kabsal (mentioned only)

Plot summary

Shallan is sitting in her room restlessly drawing the deaths of the four robbers from three nights ago, even though she didn't deliberately take the memories. As she draws, she thinks about different concepts of logic and philosophy, considering Jasnah's actions and reasons in the context of the different schools of thought. She also worries about her own actions in stealing the Soulcaster in the same way. Her mind wanders for a while and she looks at what she's been drawing. She's shocked to see a completely different scene being sketched -- one of a richly-dressed man lying in a pool of blood. Panicked, she hurries from the room and runs into a servant who informs her that one of her spanreeds is flashing and hands it over to her. Going into the main room, she is glad to find her brother Balat talking to her. She tells him that she has managed to steal the Soulcaster but hasn't left yet so as not to draw suspicion onto herself. Balat informs her that the "friends" of their father visited again. Shallan frets even more about the theft and when a chambermaid comes to their quarters, she starts worrying about the Soulcaster's safety. She decides to put it into her safe-pouch and leaves the room with a basket full of bread and Bluebar jam left by Kabsal.

Two hours later sitting in the palace gardens, Shallan has calmed down and is drawing some snails and plants. She notes the symbiotic relationship between a snail she is drawing and the shalebark it is on, writing it down next to her drawing. After making sure she is alone, she gets the Soulcaster out to try to puzzle out how to use it since Luesh can no longer show them how. She has no luck and tries to think of other ways to get it to work or save her family.`
  },
  40: {
    title: 'Eyes of Red and Blue',
    pov: 'Kaladin',
    text: `Chapter 40: Eyes of Red and Blue

Characters

Kaladin (point of view)

Lopen

Rock

Moash

Torfin

Hobber

Peet

Teft

Dabbid

Natam

Sigzil

Syl

Maps

Dunny

Skar

Bisig

Stormfather (mentioned only)

Idolir (mentioned only)

Treff (mentioned only)

Gaz (mentioned only)

Torol Sadeas (mentioned only)

Plot Summary

Kaladin leaves the barrack for the first time after his judgment in the highstorm. He is fairly weak, but his wounds are mostly gone. The members of Bridge Four, doing daily bridge training, nearly stumble over one another when they see him. Moash tells him that it's only been ten days and Rock says Kaladin must have bones like granite. When the horns blow for a bridge run and Bridge Four -- on duty -- gathers, Kaladin joins them, helping Lopen and Dabbid with the water. Later he watches the battle, thinking about what he did with the side carry and comes to understand what's the purpose of bridgemen: to be bait for the Parshendi because bridgemen are cheaper than soldiers and don't need training and equipment.

Later that evening, Bridge Four gives Rock a razor as a gift for his making the stew every evening. With tears in his eyes, he runs into the barrack, leaving the others wondering if the gift was a good idea. Dunny starts to serve the stew to the others. Only Sigzil doesn't join in, so Kaladin seeks him out for a conversation. He tells Kaladin about Marabethia and their method of execution. Eventually Rock comes back, shaved, happy and grateful and tells Bridge Four that he will shave everybody who wants it. Kaladin despairs that the old wretch is coming back because he knows the bridgemen really have no chance to survive.`
  },
  41: {
    title: 'Of Alds and Milp',
    pov: 'Kaladin',
    timeContext: 'Five and a half years ago',
    text: `Chapter 41: Of Alds and Milp

Characters

Kaladin (point of view)

Laral Roshone

Lirin

Rillir Roshone

Toralin Roshone

Hesina

Tien

Wistiow (mentioned only)

Alds (mentioned only)

Milp (mentioned only)

Plot Summary

Brightlord Roshone and his son Rillir were attacked by whitespine while on a hunt. Rillir is mortally wounded. Lirin tries to save him, but realizes it is hopeless, so he turns his attention to Roshone, who demands that he go back to helping his son. Lirin refuses, explaining the guidelines of a surgeon with two patients: if the wounds are equal, treat the youngest first; if the wounds are not equally threatening, treat the worst wound first. The third guideline supersedes the first two: a surgeon must know when someone is beyond their ability to help. While stitching up part of Roshone's wound, Lirin's knife is dangerously close to a major artery. He hesitates and his hand shakes, but he continues and saves Roshone's life.

Kaladin asks Lirin later why he didn't cut the artery and let Roshone die, as it would've solved all of their problems. Lirin says it would have been murder, and he is not a killer. Even if the lighteyes don't care about life, somebody has to start caring. Kaladin realizes that, given the option, he would have let Roshone die. He decides that just as some body parts are beyond repair in a surgery, some people need to be removed.`
  },
  42: {
    title: 'Beggars and Barmaids',
    pov: 'Shallan Davar',
    text: `Chapter 42: Beggars and Barmaids

Characters

Shallan Davar (point of view)

Jasnah Kholin

Kabsal

Masly (mentioned only)

Coldwin (mentioned only)

Hasavah (mentioned only)

Cormshen (mentioned only)

Innia (mentioned only)

Talatin (mentioned only)

Guvlow (mentioned only)

Elhokar Kholin (mentioned only)

Tozbek (mentioned only)

Ashlv (mentioned only)

Plot Summary

Shallan tells Jasnah that she thinks she was technically right to kill the footpads, but she acted immorally and unethically. Jasnah is satisfied that Shallan has learned a good deal from the lesson and dismisses her for the rest of the day. It's been two weeks since the Soulcaster was stolen, and Shallan is puzzled that Jasnah hasn't seemed to react at all. Back in her chambers, she attempts to use the Soulcaster while humming for half an hour. She wonders if Jasnah might have duped her with a fake. She takes a break and starts sketching, and she suddenly hears a voice asking "What are you?" A maid cracks open the door, and Shallan convinces herself that she must have interpreted the random sounds of cleaning nearby as words. She scolds the maid for going into Jasnah's room, then sends her off to tell Jasnah so she can enter herself. She hurries in hoping to find notes on soulcasting. She instead finds a notebook focused on Natanatan, the Unclaimed Hills, and the Shattered Plains. The two others contain notes on Urithiru and the Voidbringers. Shallan wonders why a nonbeliever like Jasnah would concern herself with what she herself considers fables. A knock on the door reveals Kabsal, who having heard that she has free time, brought some bread and jam for a picnic.

Kabsal explains the stories behind the Truthberry jam. Shallan laments that she isn't much of a scholar since she prefers the outdoors. Kabsal starts flirting, and although Shallan thinks that it wouldn't work out for them, she encourages him. He implies that he might leave the ardentia for her. Shallan steers the conversation to Jasnah. He reveals that his initial plan was to get Shallan to help him steal her soulcaster, but his superiors disapproved. They were afraid that Elhokar might start a war with Kharbranth. Shallan probes for some hints on how to use it. He says you only have to tap a gem and touch the object you wish to change, but Jasnah doesn't do that. Kabsal leaves and Shallan returns inside, finding a note from Captain Tozbek informing her that he will arrive in one week. She wants to study as much as possible before leaving, so she goes back to Jasnah to read.`
  },
  43: {
    title: 'The Wretch',
    pov: 'Kaladin',
    text: `Chapter 43: The Wretch

Characters

Kaladin (point of view)

Hobber

Syl

Hashal

Avarak Matal

Rock

Gaz

Dunny

Moash

Peet

Teft

Sigzil

Skar

Leyten

Jaks

Lamaril (mentioned only)

Torol Sadeas (mentioned only)

Durk (mentioned only)

Tvlakv (mentioned only)

Goshel (mentioned only)

Tien (mentioned only)

Tukks (mentioned only)

Dallet (mentioned only)

Plot Summary

Kaladin wakes up feeling dread and despair, as he realizes that all of the Bridgemen are simply bait, destined to die. He finds the rest of the men lined up and waiting for him to lead them in practice. Before he can tell them how useless it is, he sees Lamaril's replacement: Brightlord Matal and his wife Hashal. Hashal speaks for her husband and tells Kaladin that the Almighty has simply given Kaladin another chance to prove himself as a bridgeman, nothing more. She claims that her husband is a well respected and honored associate of Sadeas, and Kaladin wonders out loud how he ended up in this position. Hashal directs one of her men to beat him, but Kaladin catches the spear aimed at him. In his mind he sees how to beat not only the soldier attacking him but his three companions as well, but decides against it, letting go of the spear and letting the next hit land. She informs them that they'll only be doing chasm duty from now on.

Kaladin climbs down into the chasm. Syl wonders why he isn't happy from surviving the highstorm. Kaladin chafes from not fighting the soldiers, but it wouldn't have helped to protect the men. Syl vaguely remembers helping men kill, to Kaladin's shock. Sometimes it is right to kill. The rest of the men climb down and Kaladin starts walking. Rock asks what they are going to do next in order to fight, and Kaladin insists that the fight is over. They find a pile of bodies and get to work. Teft stops by and also asks what's next, and Kaladin angrily replies that there is no hope, leading some of the men to grumble. Teft argues that it's not about surviving, quoting part of the Radiant oath "journey before destination." Syl likes the saying and encourages Kaladin to not give up. Kaladin thinks for a while and finally decides to try again, announcing to the men that the only chance is to try to escape. He offers to train them as spearmen, hoping it will increase their poor odds of escaping. All but Rock eagerly agree. Fighting is beneath Rock; he will cook instead.`
  },
  44: {
    title: 'The Weeping',
    pov: 'Kaladin',
    timeContext: 'Five years ago',
    text: `Chapter 44: The Weeping

Characters

Kaladin (point of view)

Tien

Hesina

Lirin

Jost

Naget

Waber

Toralin Roshone

Meridas Amaram

Laral Roshone

Natir

Alaxia

Callins

Abry

Harl

Rillir Roshone (mentioned only)

Ral (mentioned only)

Gavilar Kholin (mentioned only)

Torol Sadeas (mentioned only)

Agil (mentioned only)

Marf (mentioned only)

Caull (mentioned only)

Taleb (mentioned only)

Habrin (mentioned only)

Arafik (mentioned only)

Jorna (mentioned only)

Loats (mentioned only)

Plot Summary

Kaladin lays on the roof after making a temporary repair. Tien joins him and gives him a beautifully carved wooden horse. Kaladin worries because his father had to spend another sphere. Their mother comes out and joins them, trying to assuage his concerns. The only reason he spent one was to try to bluff Roshone into thinking they were growing desperate. They discuss his future prospects, including the possibility of pursuing other professions, but Kaladin is set on becoming a surgeon like his father. Lirin comes out and tells them there is a gathering in the square. When they arrive, they notice that Laral is engaged, apparently to Roshone himself. Kaladin is appalled and starts forward to "stop it," but Lirin tells him to stand down. Roshone announces that Amaram is here to recruit, and several young men volunteer. The quota is not met, however, so Amaram tells Roshone to read the list of conscripts. The last name read is Tien. Amaram is familiar with the situation and asks Roshone to provide a different name, but Roshone insists. Kaladin tries to volunteer to take his place, but again Roshone insists that Tien be conscripted. So Kaladin instead volunteers in order to protect him. He is relieved, but their parents walk away devastated and crying. Kaladin swears an oath that he'll bring back Tien in four years.`
  },
  45: {
    title: 'Shadesmar',
    pov: 'Shallan Davar',
    text: `Chapter 45: Shadesmar

Characters

Shallan Davar (point of view)

Jasnah Kholin

Kabsal

Yelig-nar (mentioned only)

Traxil (mentioned only)

Gavilar Kholin (mentioned only)

Matain (mentioned only)

Klade (mentioned only)

Navani Kholin (mentioned only)

Tifandor (mentioned only)

the Almighty (mentioned only)

Lin Davar (mentioned only)

Plot Summary

Shallan continues her study of Gavilar's meetings with the Parshendi before his death. She notices a discrepancy about Gavilar's uncharacteristic scholarly interest in the Parshendi. She plans to leave for Jah Keved the next day to take the stolen Soulcaster to her family. Under the pretense of looking for another book, she researches a little of her own about the Voidbringers, knowing that it's Jasnah's true research interest. After studying for a couple of hours, Kabsal finds her. After a theological discussion about the Voidbringers, she tells him of her plans to leave. He requests a likeness of him from her, and after paying her for it, asks for another one with himself and her in the picture. She draws two creatures in the background, with symbols for a head. Frightened, she runs to her room while being pursued by the creatures, which continue to show up in her sketches as she runs through the halls. Trapped in her room, she begins to summon her Shardblade and one of the creatures asks her what she is. While touching a glass goblet filled with diamond spheres, her response of "I'm terrified" transports her to Shadesmar where she Soulcasts the goblet to blood. Back in her room, Jasnah calls to her from outside her door. Terrified that she will discover her soulcasting, she cuts herself to explain the presence of the blood.`
  }
};

// Interlude data
const INTERLUDE_DATA = {
  1: {
    title: 'Ishikk',
    pov: 'Ishikk',
    text: `Interlude I-1: Ishikk

Characters

Ishikk (point of view)

Thaspic

Maib

Blunt

Grump

Thinker

Hoid (mentioned only)

Plot summary

Ishikk, a fisherman in the Purelake, is just returning home after a long day of fishing. After pausing to talk to Thaspic he meets with Maib, a local woman who has been attempting to get him to marry her for years by trying to keep him in her debt, mostly by giving him food. Ishikk tries to counterbalance her efforts by bringing her fish that cure her aches in her joints.

Following a brief conversation with Maib, Ishikk goes to meet with a group of foreigners. They ask him about whether he has any new information for them, and Ishikk tells them that he has been to many villages in the area and none of them know anything about the man the foreigners are looking for, revealed to be Hoid. The foreigners (all worldhoppers, namely Demoux from Scadrial, Galladon from Sel and Baon from Taldain) argue amongst themselves for a while, then leave Ishikk to his thoughts.`
  },
  2: {
    title: 'Nan Balat',
    pov: 'Balat Davar',
    text: `Interlude I-2: Nan Balat

Characters

Balat Davar (point of view)

Scrak

Wikim Davar

Eylita (mentioned only)

Shallan Davar (mentioned only)

Lin Davar (mentioned only)

Helaran Davar (mentioned only)

Jushu Davar (mentioned only)

Plot summary

Balat Davar, Shallan's brother, is torturing various small animals in the gardens of their family's estate. He reflects on how Shallan is doing most of the work to save their family and tries to convince himself that he isn't a coward for remaining at home to manage the estate. He admits to some resentment of Shallan because of all of their siblings, she was the only one their father never truly got angry at, but is shortly interrupted in his thoughts by Wikim, another brother, coming to find him with the announcement that they have a big problem.`
  },
  3: {
    title: 'The Glory of Ignorance',
    pov: 'Szeth',
    text: `Interlude I-3: The Glory of Ignorance

Characters

Szeth (point of view)

Took

Ton

Amark

Avado (mentioned only)

Gavilar Kholin (mentioned only)

the Nightwatcher (mentioned only)

Plot summary

Szeth is now serving a man named Took, who uses him to gain the admiration of mine workers (and free drinks) in the small towns they pass through. As a demonstration of Szeth's total obedience, he has him do various things, such as jump up and down and cut his own arm. When he orders Szeth to kill himself, Szeth informs him that he cannot be ordered to kill himself, and returns to his own thoughts. The others are shocked at how refined his speech is and are slightly discomfited, associating him with the lighteyes. Szeth reflects that his speech and mannerisms may well be part of the reason that his masters never keep him for long, since his masters know that he is capable of so much more than they are using him for, and that in many ways, he is much more refined and intelligent than they are. Szeth revels in his common labor, though, as it means that he is not being used to spill more blood.

As the night passes on and it becomes apparent that the townsfolk are no longer really listening to Took's stories, Took and Szeth leave. However, on the way out of town, Took is killed by a group of thugs, who consider selling Szeth to the slavers. Then one of them picks up Szeth's Oathstone, and he informs them of his obligation to serve them as long as they hold it. When asked for clarification, Szeth tells him that he must obey any order except to kill himself, and thinks to himself that he can't be asked to give up his Shardblade either, but the man need not know that. The man muses for a moment on the possibilities he has with such a servant.`
  },
  4: {
    title: 'Rysn',
    pov: 'Rysn Ftori',
    text: `Interlude I-4: Rysn

Characters

Rysn Ftori (point of view)

Vstim

Kylrm

Thresh-son-Esan

Szeth (mentioned only)

Plot summary

Rysn and her babsk Vstim visit Shinovar to trade with the Shin. She's annoyed at the strange grass that doesn't retract. Vstim has her set up a fabrial that warns when people are approaching. When the Shin arrive, she thinks the guards are servants because they are dressed plainly, and Vstim explains that Shin farmers are highest in the social order and warriors are the lowest. Vstim offers Thresh scraps of Soulcast metal in exchange for chickens and other valuable exotic goods. The metal is certified to be Soulcast from organic materials and not mined. Vstim asks if Thresh has another servant like the one he gave him seven years ago that was so obedient. Thresh says that he was a worthless Truthless (Szeth) and that he hoped there wouldn't be another one like him.`
  },
  5: {
    title: 'Axies the Collector',
    pov: 'Axies',
    text: `Interlude I-5: Axies the Collector

Characters

Axies (point of view)

Cusicesh

Plot summary

Axies the Collector wakes up in an alley in Kasitor lying in rotting garbage. He had gotten drunk the night before to see if he could spot Alespren, and he's been deposited here, naked. He manages to grab a ratty blanket from an insane beggar and walks out into the streets, drawing stares. He heads to the docks, where many people are waiting. Cusicesh the Protector appears in the water, leaving him feeling drained. A street urchin grabs his blanket, leaving him naked again. He's hauled off to jail, content at having seen two new spren. Perhaps he will finally see the elusive captivityspren.`
  },
  6: {
    title: 'A Work of Art',
    pov: 'Szeth',
    text: `Interlude I-6: A Work of Art

Characters

Szeth (point of view)

Makkek

Gavashaw

Took (mentioned only)

Neturo (mentioned only)

Hanavanar (mentioned only)

Plot summary

Szeth sits in a gambling den as his owner, Makkek, parades about with a woman on each arm. He has grown fat and rich since coming into possession of Szeth. He gives a signal to Szeth, and he heads out on his latest assassination assignment: Gavashaw, a new arrival in town who had hoped to challenge Makkek with his own gambling den. He sneaks into his house and hears nothing in his room, so he sends in a decoy -- a wooden knob "dressed" in a robe (curtain) -- by lashing it to the far wall. The decoy isn't attacked, so he slinks into the room, finding Gavashaw's severed head. A new master is there, who produces Makkek's head and Szeth's Oathstone. He is given a list of high ranking noble men to assassinate.`
  }
};

async function generateChapterNotes(chapterType, chapterNumber = null, interludeNumber = null) {
  const bookTitle = 'The Way of Kings';
  const bookSlug = normalizeBookTitle(bookTitle);
  
  // Check for Series structure
  const seriesPath = path.join(__dirname, '..', 'rag', 'Series');
  const seriesMap = {
    'rhythm-of-war': 'The Stormlight Archive',
    'words-of-radiance': 'The Stormlight Archive',
    'the-way-of-kings': 'The Stormlight Archive',
    'oathbringer': 'The Stormlight Archive',
    'dawnshard': 'The Stormlight Archive'
  };
  
  let chaptersDir = null;
  
  // Try Series structure first
  if (seriesMap[bookSlug]) {
    const seriesName = seriesMap[bookSlug];
    const seriesBookPath = path.join(seriesPath, seriesName, 'books', bookSlug);
    
    if (chapterType === 'prologue') {
      chaptersDir = path.join(seriesBookPath, 'chapters');
    } else if (chapterType === 'chapter') {
      // Determine which part based on chapter number
      // Part 1: chapters 1-11
      // Part 2: chapters 12-28
      // Part 3: chapters 29+
      let partNumber = 1;
      if (chapterNumber && chapterNumber >= 12 && chapterNumber <= 28) {
        partNumber = 2;
      } else if (chapterNumber && chapterNumber >= 29 && chapterNumber <= 50) {
        partNumber = 3;
      } else if (chapterNumber && chapterNumber >= 51) {
        partNumber = 4; // Adjust as needed for later parts
      }
      
      const partNames = {
        1: 'Part 1',
        2: 'Part 2',
        3: 'Part 3',
        4: 'Part 4'
      };
      
      chaptersDir = path.join(seriesBookPath, 'chapters', partNames[partNumber] || 'Part 1');
      if (!fs.existsSync(chaptersDir)) {
        fs.mkdirSync(chaptersDir, { recursive: true });
      }
    } else if (chapterType === 'interlude') {
      // Interlude structure: interlude-1/interlude-i-1.md (same as Rhythm of War)
      const interludeDirName = `interlude-${interludeNumber}`;
      chaptersDir = path.join(seriesBookPath, 'chapters', interludeDirName);
      if (!fs.existsSync(chaptersDir)) {
        fs.mkdirSync(chaptersDir, { recursive: true });
      }
    }
  }
  
  // Fallback to legacy structure
  if (!chaptersDir || !fs.existsSync(path.dirname(chaptersDir))) {
    chaptersDir = path.join(__dirname, '..', 'rag', 'books', bookSlug, 'chapters');
  }
  
  // Ensure directory exists
  if (!fs.existsSync(chaptersDir)) {
    fs.mkdirSync(chaptersDir, { recursive: true });
  }

  // Get chapter data
  let chapterData;
  let chapterIdentifier;
  let outputFile;
  
  if (chapterType === 'prologue') {
    chapterData = CHAPTER_DATA.prologue;
    chapterIdentifier = 'Prologue';
    outputFile = path.join(chaptersDir, 'prologue.md');
  } else if (chapterType === 'chapter' && chapterNumber) {
    chapterData = CHAPTER_DATA[chapterNumber];
    if (!chapterData) {
      console.error(`❌ No data found for Chapter ${chapterNumber}`);
      process.exit(1);
    }
    chapterIdentifier = chapterNumber;
    outputFile = path.join(chaptersDir, `chapter-${String(chapterNumber).padStart(2, '0')}.md`);
  } else if (chapterType === 'interlude' && interludeNumber && chapterNumber) {
    // Interlude structure: interlude-i-1.md
    chapterData = INTERLUDE_DATA[chapterNumber];
    if (!chapterData) {
      console.error(`❌ No data found for Interlude I-${chapterNumber}`);
      process.exit(1);
    }
    chapterIdentifier = `Interlude I-${chapterNumber}`;
    outputFile = path.join(chaptersDir, `interlude-i-${chapterNumber}.md`);
  } else {
    console.error('❌ Invalid chapter type or number');
    process.exit(1);
  }

  // Check if file already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⚠️  File already exists: ${outputFile}`);
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('Overwrite? (y/n): ', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled.');
      return;
    }
  }

  console.log(`\n📚 Generating notes for ${bookTitle}, ${chapterType === 'prologue' ? 'Prologue' : `Chapter ${chapterNumber}`}...\n`);
  console.log(`✅ Using provided text (${chapterData.text.length} characters)`);
  console.log('\n🤖 Generating formatted notes with AI... (this may take 30-60 seconds)\n');

  // Generate prompt with the chapter text
  const prompt = getChapterNotesPrompt(bookTitle, chapterIdentifier, chapterData.text);
  
  // Generate formatted notes
  let formattedNotes;
  try {
    formattedNotes = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    });
  } catch (error) {
    console.error('❌ Failed to generate notes:', error.message);
    process.exit(1);
  }

  // Save formatted notes
  fs.writeFileSync(outputFile, formattedNotes, 'utf-8');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ DONE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Formatted notes saved to:`);
  console.log(`   ${outputFile}\n`);
  console.log(`📝 The notes are ready to use with Rowan!\n`);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node generate-twok-chapters.js <prologue|chapter|interlude> [chapterNumber] [interludeGroup]');
    console.error('Example: node generate-twok-chapters.js prologue');
    console.error('Example: node generate-twok-chapters.js chapter 1');
    console.error('Example: node generate-twok-chapters.js interlude 1 1  (for Interlude I-1, in interlude-1 folder)');
    process.exit(1);
  }

  const chapterType = args[0];
  const chapterNumber = args[1] ? parseInt(args[1], 10) : null;
  const interludeGroup = args[2] ? parseInt(args[2], 10) : null;

  if ((chapterType === 'chapter' || chapterType === 'interlude') && (!chapterNumber || isNaN(chapterNumber) || chapterNumber < 1)) {
    console.error('❌ Chapter/Interlude number must be a positive integer');
    process.exit(1);
  }

  if (chapterType === 'interlude' && (!interludeGroup || isNaN(interludeGroup) || interludeGroup < 1)) {
    console.error('❌ Interlude group number must be a positive integer');
    process.exit(1);
  }

  generateChapterNotes(chapterType, chapterNumber, interludeGroup).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { generateChapterNotes, CHAPTER_DATA, INTERLUDE_DATA };

