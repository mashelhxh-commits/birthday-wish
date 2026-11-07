// ================= CUSTOMIZE YOUR BIRTHDAY WORLD HERE =================
const CONFIG = {
  herName: "Kanak",                 // Change her name here
  passcode: "143",                  // Change the secret code here
  intro: "Today, the world gets to celebrate you, and I get to celebrate the person who makes my world a little more beautiful.",
  musicFile: "assets/your-song.mp3", // Add your audio file to the assets folder
  memories: [
    { image: "assets/memory-1.jpg", caption: "One of my favourite moments." },
    { image: "assets/memory-2.jpg", caption: "A memory I wish I could relive." },
    { image: "assets/memory-3.jpg", caption: "You, being effortlessly adorable." },
    { image: "assets/memory-4.jpg", caption: "A little moment that means a lot." },
    { image: "assets/memory-5.jpg", caption: "Some memories never get old." },
    { image: "assets/memory-6.jpg", caption: "I hope we make a thousand more." }
  ],
  gifts: [
    { title: "A letter from me", icon: "♡", content: "If I could wrap one thing for you, it would be a reminder of how loved you are. Thank you for being you. ♡" },
    { title: "Our little memories", icon: "✧", content: "Every picture is a little bookmark in our story. I can't wait to add many more pages with you." },
    { title: "A song for you", icon: "♫", content: "This gift is a song. Add your chosen audio file using the musicFile setting near the top of script.js, then press Play in the top bar." },
    { title: "Flowers, just because", icon: "❀", content: "If I could, I'd fill your room with flowers today. Until then, here's a whole digital bouquet for you." },
    { title: "One last secret", icon: "☆", content: "The biggest gift in all of this is having you in my life. Here's to all the birthdays and memories still waiting for us. ❤️" }
  ],
  starMessages: [
    "You make ordinary days special.",
    "I hope you never stop smiling.",
    "You deserve every beautiful thing.",
    "I'm always rooting for you.",
    "You are loved, more than you know.",
    "Your little joys matter to me.",
    "Never feel you have to be anyone else.",
    "I hope this year is gentle with you.",
    "I am grateful our paths crossed.",
    "There are so many memories ahead of us."
  ],
  letter: `Happy birthday, my love.

I don't think words will ever be enough to explain how much you mean to me, but today I want to try.

First of all, I hope life treats you gently. I hope you find happiness in the smallest things, achieve everything you've quietly wished for, and never lose the beautiful parts of yourself that make you who you are.

I love the way you talk about your day, the little things that excite you, your random expressions, your childish moments and even the things you think are imperfections.

I hope you never feel that you have to be someone else to deserve love. You are worthy of all the beautiful things life has to offer, exactly as you are.

There will be days when life gets difficult, days when things don't go according to plan and days when you might feel a little lost. I hope you remember that you don't always have to carry everything alone.

I wish I could be there today, celebrate with you, see your smile and make this birthday feel as special as you deserve.

Until the day we can make these memories together in person, let this little corner of the internet remind you how loved you are.

Thank you for being you.

Happy birthday once again, my favourite person.

I love you, always. ❤️`,
  finalMessage: "No matter how many birthdays pass, I hope I get to celebrate many more of them with you."
};
// ================= END OF CUSTOMIZATION =================

const $ = id => document.getElementById(id);
$("herNameTitle").textContent = CONFIG.herName;
$("introText").textContent = CONFIG.intro;
$("finalText").textContent = CONFIG.finalMessage;
$("letterText").textContent = CONFIG.letter;
$("music").src = CONFIG.musicFile;

$("unlock").addEventListener("click", unlock);
$("passcode").addEventListener("keydown", e => { if(e.key==="Enter") unlock(); });
function unlock(){
  if($("passcode").value === CONFIG.passcode){
    $("lock").classList.add("hidden"); $("questions").classList.remove("hidden");
  } else $("error").textContent = "That code is not quite right. Try again, birthday girl. ♡";
}
let q=0;
const qs=[
 ["Are you ready for a little surprise?","There are a few tiny things waiting for you.","YESSS! ♡","Wait, what is this?"],
 ["Are you excited?","I hope you brought a little curiosity.","SO EXCITED!","A little nervous hehe."],
 ["Do you know how special you are?","I have a feeling I should remind you.","Tell me! ❤️","Maybe?"]
];
function setQuestion(){ $("questionTitle").textContent=qs[q][0];$("questionSub").textContent=qs[q][1];$("yes").textContent=qs[q][2];$("maybe").textContent=qs[q][3];}
function nextQuestion(){q++;if(q>=qs.length){$("questions").classList.add("hidden");$("experience").classList.remove("hidden");window.scrollTo(0,0);petals(24);}else setQuestion();}
$("yes").onclick=nextQuestion;$("maybe").onclick=nextQuestion;setQuestion();

function showModal(title,body,icon="♡"){ $("modalTitle").textContent=title;$("modalBody").textContent=body;$("modalIcon").textContent=icon;$("modal").classList.remove("hidden"); }
$("modalClose").onclick=()=>$("modal").classList.add("hidden");
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))$("modal").classList.add("hidden");});

function petals(n=12){for(let i=0;i<n;i++){const p=document.createElement("div");p.className="petal";p.textContent=["♡","✿","♥","✧"][Math.floor(Math.random()*4)];p.style.left=Math.random()*100+"vw";p.style.animationDuration=(4+Math.random()*5)+"s";p.style.fontSize=(12+Math.random()*18)+"px";p.style.color=["#d98e9e","#e9b7c2","#d6b77a"][i%3];document.body.appendChild(p);setTimeout(()=>p.remove(),9500);}}
setInterval(()=>{if(!$("experience").classList.contains("hidden"))petals(2)},4500);

$("wishBtn").onclick=()=>$("cakeMessage").textContent="Wish made? Keep it close to your heart. ♡";
$("blowBtn").onclick=()=>{if(window.extinguishCakeCandle)window.extinguishCakeCandle();$("cakeMessage").textContent="May all your little wishes find their way to you. Happy birthday! ♡";petals(35);};
$("stayBtn").onclick=()=>{$("cozyMessage").textContent="Let's stay a little longer. No rush, no noise, just a peaceful moment together. ♡";petals(8);};

const grid=$("memoryGrid");
CONFIG.memories.forEach((m,i)=>{
 const card=document.createElement("div");card.className="photo";card.style.setProperty("--r",`${[-2,2,-1,1.5,-2.5,1][i%6]}deg`);
 const img=document.createElement("img");img.src=m.image;img.alt="Memory "+(i+1);img.onerror=()=>{img.remove();const ph=document.createElement("div");ph.className="placeholder";ph.textContent="♡";card.prepend(ph);};
 const cap=document.createElement("p");cap.textContent=m.caption;card.append(img,cap);card.onclick=()=>showModal("A little memory",m.caption,"📸");grid.append(card);
});
const gifts=$("giftGrid");
CONFIG.gifts.forEach((g,i)=>{
 const card=document.createElement("div");card.className="card gift";card.innerHTML=`<div><div class="giftbox"><div class="giftlid"></div><div class="giftbody"></div><div class="ribbon"></div><div class="bow">♧</div></div><h3 class="serif">${g.title}</h3><p class="tiny">Tap to open</p></div>`;
 card.onclick=()=>{if(card.classList.contains("open")){showModal(g.title,g.content,g.icon);return;}card.classList.add("open");card.querySelector(".tiny").textContent="Opened ♡";petals(12);showModal(g.title,g.content,g.icon);};
 gifts.append(card);
});
const starBox=$("stars");
CONFIG.starMessages.forEach((msg,i)=>{const s=document.createElement("span");s.className="star";s.textContent="✦";s.style.left=(8+(i*19)%84)+"%";s.style.top=(18+(i*31)%65)+"%";s.style.animationDelay=(i*.2)+"s";s.onclick=()=>{$("starMessage").textContent=msg;};starBox.append(s);});
$("hugBtn").onclick=()=>{$("hugResult").textContent="Sending the biggest little hug your way! ♡";petals(18);};

const audio=$("music");let playing=false;
$("musicToggle").onclick=async()=>{try{if(!playing){await audio.play();playing=true;$("musicToggle").textContent="♫ Pause";}else{audio.pause();playing=false;$("musicToggle").textContent="♫ Play";}}catch(e){showModal("Add your song","Place an audio file at the path set in script.js, inside the assets folder.","♫");}};
$("volume").oninput=e=>audio.volume=Number(e.target.value);
window.addEventListener("scroll",()=>{const max=document.documentElement.scrollHeight-innerHeight;$("progress").style.width=(max>0?scrollY/max*100:0)+"%";});
