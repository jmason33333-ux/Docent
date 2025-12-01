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
      // Part 2: chapters 12+
      let partNumber = 1;
      if (chapterNumber && chapterNumber >= 12 && chapterNumber <= 26) {
        partNumber = 2;
      } else if (chapterNumber && chapterNumber >= 27 && chapterNumber <= 50) {
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

