
"use strict";

// ===============================================
// ABAI LITERATURE — BY DARKHAN
// ОТЫЗ ЕКІНШІ ҚАРА СӨЗ
// 80 МИНУТ • 24 ОҚУШЫ • 3 КОМАНДА
// ===============================================

const $ = id => document.getElementById(id);

const STORAGE_KEY = "abai_32_darkhan_v1";
const PAGE_COUNT = 16;

// Барлығы — 80 минут
const PAGE_MINUTES = [
  2,                  // 0 Кіріспе
  3,                  // 1 Абай
  3, 3, 3, 3, 3, 3, 3,// 2–8 Түсіндіру
  5,                  // 9 Видео
  12,                 // 10 Конспект
  3,                  // 11 Қатысушылар
  15,                 // 12 Ауызша
  8,                  // 13 Тест
  9,                  // 14 Үш ойын
  2                   // 15 Қорытынды
];

const STUDENT_NAMES = [
  "Рамазан",
  "Тұрғанжан",
  "Нұрай",
  "Әлқуат",
  "Шырай",
  "Гүлсезім",
  "Маржан",
  "Мариям",
  "Жансая",
  "Азиза",
  "Ақсезім",
  "Нұрболсын",
  "Ақнұр",
  "Іңкәр",
  "Асхат",
  "Аяжан",
  "Мирас",
  "Санжар",
  "Ерасыл",
  "Нұрасыл",
  "Расул",
  "Айнұр",
  "Дархан",
  "Айкерім"
];

const TEAM_NAMES = [
  "📜 Талап",
  "🧠 Ақиқат",
  "🛡️ Қайрат"
];

// ===============================================
// 1. ҚОСЫМША ФУНКЦИЯЛАР
// ===============================================

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(
    object,
    key
  );
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j], result[i]
    ];
  }

  return result;
}

function randomFrom(items) {
  if (!items.length) return null;

  return items[
    Math.floor(Math.random() * items.length)
  ];
}

// ===============================================
// 2. САБАҚ КҮЙІ
// ===============================================

function initialState() {
  return {
    page: 0,
    startedAt: null,
    pageEnteredAt: null,

    students: STUDENT_NAMES.map((name, id) => ({
      id,
      name,
      present: true
    })),

    teamOrder: shuffle(
      STUDENT_NAMES.map((_, id) => id)
    ),

    oral: {},
    quiz: {},
    battle: {},
    logic: {},
    creative: {},

    oralSelected: null,
    quizSelected: null,
    battleIndex: 0
  };
}

let state = initialState();

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
  );

  if (
    saved &&
    Array.isArray(saved.students) &&
    saved.students.length === 24
  ) {
    state = {
      ...initialState(),
      ...saved
    };
  }
} catch (error) {
  console.warn("Сақталған дерек оқылмады", error);
}

for (const key of [
  "oral",
  "quiz",
  "battle",
  "logic",
  "creative"
]) {
  if (
    !state[key] ||
    typeof state[key] !== "object" ||
    Array.isArray(state[key])
  ) {
    state[key] = {};
  }
}

if (
  !Array.isArray(state.teamOrder) ||
  state.teamOrder.length !== 24
) {
  state.teamOrder = shuffle(
    STUDENT_NAMES.map((_, id) => id)
  );
}

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Сақтау қатесі", error);
  }
}

// ===============================================
// 3. ҚАТЫСУШЫЛАР ЖӘНЕ КОМАНДАЛАР
// ===============================================

function presentStudents() {
  return state.students.filter(s => s.present);
}

function teamCount() {
  return Math.min(3, presentStudents().length);
}

function orderedParticipants() {
  const participants = new Map(
    presentStudents().map(s => [s.id, s])
  );

  return state.teamOrder
    .filter(id => participants.has(id))
    .map(id => participants.get(id));
}

function studentTeam(id) {
  const index = orderedParticipants()
    .findIndex(s => s.id === id);

  if (index < 0 || !teamCount()) {
    return -1;
  }

  return index % teamCount();
}

function teamMembers(team) {
  return orderedParticipants().filter(
    s => studentTeam(s.id) === team
  );
}

// ===============================================
// 4. НАВИГАЦИЯ
// ===============================================

function goTo(page) {
  page = Number(page);

  if (
    !Number.isInteger(page) ||
    page < 0 ||
    page >= PAGE_COUNT
  ) return;

  if (!state.startedAt) {
    state.startedAt = Date.now();
  }

  // Видео бетінен шыққанда тоқтату
  if (state.page === 9 && page !== 9) {
    stopVideo();

    const audio = document.querySelector("audio");
    if (audio) audio.pause();
  }

  if (
    page !== state.page ||
    !state.pageEnteredAt
  ) {
    state.pageEnteredAt = Date.now();
  }

  state.page = page;

  for (let i = 0; i < PAGE_COUNT; i++) {
    const active = i === page;
    const screen = $("page-" + i);

    screen.hidden = !active;
    screen.classList.toggle("active", active);
  }

  document.querySelectorAll(".nav-btn")
    .forEach(btn => {
      const active =
        Number(btn.dataset.page) === page;

      btn.classList.toggle("active", active);
    });

  $("pageIndicator").textContent =
    `${page + 1} / ${PAGE_COUNT}`;

  $("prevPage").disabled = page === 0;

  $("nextPage").disabled =
    page === PAGE_COUNT - 1;

  $("nextPage").textContent =
    page === PAGE_COUNT - 2
      ? "Қорытынды →"
      : "Келесі →";

  refresh();
  save();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.goTo = goTo;

document.querySelectorAll(".nav-btn")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      goTo(Number(btn.dataset.page));
    });
  });

$("prevPage").addEventListener("click", () => {
  goTo(state.page - 1);
});

$("nextPage").addEventListener("click", () => {
  goTo(state.page + 1);
});

// ===============================================
// 5. 80 МИНУТ ТАЙМЕРІ
// ===============================================

function formatTime(seconds) {
  const total = Math.max(
    0,
    Math.floor(seconds)
  );

  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remaining).padStart(2, "0")
  );
}

function updateClock() {
  const now = Date.now();

  const elapsed = state.startedAt
    ? Math.floor(
        (now - state.startedAt) / 1000
      )
    : 0;

  const pageElapsed = state.pageEnteredAt
    ? Math.floor(
        (now - state.pageEnteredAt) / 1000
      )
    : 0;

  const pageLimit =
    PAGE_MINUTES[state.page] * 60;

  const remaining = Math.max(
    0,
    pageLimit - pageElapsed
  );

  $("totalClock").textContent =
    formatTime(elapsed);

  $("pageClock").textContent =
    formatTime(remaining);

  $("totalClock").style.color =
    elapsed >= 80 * 60
      ? "#ffb1a8"
      : "#69d6a3";

  $("pageClock").style.color =
    pageElapsed >= pageLimit
      ? "#f77f96"
      : "#69d6a3";
}

setInterval(updateClock, 1000);

// ===============================================
// 6. ТОЛЫҚ ЭКРАН
// ===============================================

$("fullscreenBtn").addEventListener(
  "click",
  async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement
          .requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      alert("Толық экран режимі ашылмады.");
    }
  }
);

// ===============================================
// 7. ҚЫСҚА YOUTUBE ВИДЕОЛАРЫ
// ===============================================

const VIDEOS = [
  {
    id: "BpykeHlkvUE",
    title: "Абайдың отыз екінші қара сөзі",
    start: 0,
    end: 120
  },
  {
    id: "sRwnjdMGYSg",
    title: "Отыз екінші сөзді талдау",
    start: 0,
    end: 120
  }
];

function playVideo(index) {
  const video = VIDEOS[index];
  if (!video) return;

  $("videoPlayer").src =
    "https://www.youtube-nocookie.com/embed/" +
    video.id +
    "?start=" + video.start +
    "&end=" + video.end +
    "&rel=0&playsinline=1";

  $("videoTitle").textContent =
    "▶ " + video.title +
    " — " +
    formatTime(video.end - video.start);

  $("videoExternal").href =
    "https://www.youtube.com/watch?v=" +
    video.id +
    "&t=" + video.start + "s";
}

function stopVideo() {
  $("videoPlayer").src = "about:blank";
  $("videoTitle").textContent =
    "⏹ Видео тоқтатылды.";
}

document.querySelectorAll("[data-video]")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      playVideo(Number(btn.dataset.video));
    });
  });

$("stopVideo").addEventListener(
  "click",
  stopVideo
);

// ===============================================
// 8. ҚАТЫСУ ЖҮЙЕСІ
// ===============================================

function gamesStarted() {
  return (
    Object.keys(state.battle).length > 0 ||
    Object.keys(state.logic).length > 0 ||
    Object.keys(state.creative).length > 0
  );
}

function confirmRosterChange() {
  if (!gamesStarted()) return true;

  const confirmed = confirm(
    "Қатысушылар немесе команда құрамы " +
    "өзгерсе, командалық ойын нәтижелері " +
    "қайта басталады.\n\n" +
    "Жеке бағалар сақталады. Жалғастыру?"
  );

  if (!confirmed) return false;

  state.battle = {};
  state.logic = {};
  state.creative = {};
  state.battleIndex = 0;

  return true;
}

function fixSelections() {
  const active = new Set(
    presentStudents().map(s => s.id)
  );

  if (
    state.oralSelected &&
    !active.has(state.oralSelected.studentId)
  ) {
    state.oralSelected = null;
  }

  if (
    state.quizSelected &&
    !active.has(state.quizSelected.studentId)
  ) {
    state.quizSelected = null;
  }
}

function afterAttendanceChange(message) {
  fixSelections();
  save();
  refresh();

  $("attendanceFeedback").textContent = message;
}

function setPresence(id, present) {
  const student = state.students.find(
    s => s.id === id
  );

  if (!student ||
      student.present === present) return;

  if (!confirmRosterChange()) return;

  student.present = present;

  afterAttendanceChange(
    present
      ? `✅ ${student.name} қайта қосылды.`
      : `❌ ${student.name} қатыспайтындар тізіміне өтті.`
  );
}

function renderAttendance() {
  const present = presentStudents();
  const absent = state.students.filter(
    s => !s.present
  );

  $("presentCount").textContent = present.length;
  $("absentCount").textContent = absent.length;
  $("teamCount").textContent = teamCount();

  $("presentList").innerHTML =
    present.map(student => `
      <div class="student-row">
        <span class="student-number">
          ${student.id + 1}.
        </span>

        <input
          type="text"
          maxlength="60"
          value="${esc(student.name)}"
          data-name="${student.id}"
          aria-label="Оқушының есімі">

        <button
          class="small-btn remove"
          data-remove="${student.id}">
          ✕ Алып тастау
        </button>
      </div>
    `).join("");

  $("absentList").innerHTML =
    absent.length
      ? absent.map(student => `
          <div class="absent-row">
            <span>${esc(student.name)}</span>

            <button
              class="small-btn restore"
              data-restore="${student.id}">
              ↩ Қайтару
            </button>
          </div>
        `).join("")
      : "<p>Қатыспайтын оқушы жоқ.</p>";

  document.querySelectorAll("[data-remove]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        setPresence(
          Number(btn.dataset.remove),
          false
        );
      });
    });

  document.querySelectorAll("[data-restore]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        setPresence(
          Number(btn.dataset.restore),
          true
        );
      });
    });

  document.querySelectorAll("[data-name]")
    .forEach(input => {
      input.addEventListener("change", () => {
        const id = Number(input.dataset.name);
        const name = input.value.trim();

        const student = state.students.find(
          s => s.id === id
        );

        if (!student) return;

        if (!name) {
          input.value = student.name;
          return;
        }

        student.name = name;
        save();

        renderTeamRoster();
        renderOral();
        renderQuiz();
        renderScores();
      });
    });
}

$("allPresent").addEventListener(
  "click",
  () => {
    if (
      !state.students.some(s => !s.present)
    ) return;

    if (!confirmRosterChange()) return;

    state.students.forEach(s => {
      s.present = true;
    });

    afterAttendanceChange(
      "✅ Барлық оқушы қайта қосылды."
    );
  }
);

$("shuffleTeams").addEventListener(
  "click",
  () => {
    if (!confirmRosterChange()) return;

    state.teamOrder = shuffle(
      STUDENT_NAMES.map((_, id) => id)
    );

    save();
    refresh();

    $("attendanceFeedback").textContent =
      "🔀 Командалар кездейсоқ қайта бөлінді.";
  }
);

function renderTeamRoster() {
  const count = teamCount();

  if (!count) {
    $("teamRoster").innerHTML =
      '<div class="card">Алдымен қатысушыларды белгіле.</div>';
    return;
  }

  $("teamRoster").innerHTML =
    TEAM_NAMES.slice(0, count)
      .map((name, team) => `
        <div class="team-card">
          <h3>${name}</h3>
          <p>${teamMembers(team).length} оқушы</p>

          <ol>
            ${teamMembers(team)
              .map(s => `
                <li>${esc(s.name)}</li>
              `).join("")}
          </ol>
        </div>
      `).join("");
}

// ===============================================
// 9. 24 КҮРДЕЛІ АУЫЗША СҰРАҚ
// ===============================================

const ORAL = [
  {
    q: "Абай отыз екінші қара сөзінде неге ғылым үйренушінің талап шарттарын ең алдымен түсіндіреді?",
    a: "Ғылымға жету тек тілекке емес, дұрыс мақсат, ықылас, ойлау, есте сақтау және мінезге байланысты."
  },
  {
    q: "Отыз екінші қара сөздің тақырыбы мен негізгі идеясын ажырат.",
    a: "Тақырыбы — білім-ғылым үйренудің шарттары. Идеясы — білімге адал, ақиқатшыл және табанды болу."
  },
  {
    q: "Абайдың «білмектіктің өзін дәулет білу» ойының астарын түсіндір.",
    a: "Адам жаңа нәрсе үйренуді өз алдына құндылық деп бағалауы керек."
  },
  {
    q: "Абайдың бірінші шартын қазіргі студент өмірінен мысалмен түсіндір.",
    a: "Студент пәнді тек баға үшін емес, оның мәнін түсіну және білімін қолдану үшін оқиды."
  },
  {
    q: "Ғылымды тек бедел алу үшін үйренудің қандай кемшілігі болуы мүмкін?",
    a: "Сыртқы марапат өзгергенде білімге деген қызығушылық азаюы мүмкін; Абай шын ықыласты жоғары қояды."
  },
  {
    q: "Екінші шартта Абай неліктен жеңуді мақсат еткен пікірталасты сынайды?",
    a: "Ондай айтыс ақиқатты іздеуден алыстап, мақтаншақтыққа және қарсыласқа өшпенділікке ұласуы мүмкін."
  },
  {
    q: "Бахас сөзінің мағынасын және Абайдың оған көзқарасын түсіндір.",
    a: "Бахас — пікірталас. Ол шындықты анықтауға көмектессе пайдалы, тек қарсыласын жеңуге арналса зиян."
  },
  {
    q: "Ғылыми пікірталас пен бос айтыстың екі айырмашылығын ата.",
    a: "Ғылыми талқылау дәлелге сүйенеді және қате пікірді түзете алады; бос айтыс тек жеңуге бағытталады."
  },
  {
    q: "Ақиқатқа берік болуды соқыр сеніммен шатастырмаудың себебі неде?",
    a: "Шындыққа адал адам жаңа сенімді дәлелді қабылдайды; соқыр сенім дәлелге қарамай ұстанады."
  },
  {
    q: "Үшінші шарттағы білімді өз мінезіне қолдану талабын түсіндір.",
    a: "Дұрыс екенін таныған нәрсені тек сөзбен айтып қоймай, өз әрекетінде ұстану керек."
  },
  {
    q: "Төртінші шарттағы мұлахаза нені білдіреді?",
    a: "Мұлахаза — ойлану, пайымдау, салыстыру және ақпараттың мәніне терең үңілу."
  },
  {
    q: "Мұхафаза ұғымының білім алудағы қызметін түсіндір.",
    a: "Мұхафаза — білгенді сақтау, есте бекіту және қажет кезде қайта қолдана алу."
  },
  {
    q: "Мұлахаза мен мұхафаза неліктен бірін-бірі толықтырады?",
    a: "Ойлау білімді түсінуге, ал сақтау оны ұмытпай қолдануға көмектеседі."
  },
  {
    q: "Студент тақырыпты жаттап алды, бірақ түсіндіре алмайды. Абайдың қай кеңесі толық орындалмады?",
    a: "Мұлахаза — терең ойланып, мағынасын түсіну қабілеті жеткіліксіз қолданылған."
  },
  {
    q: "Студент тақырыпты түсінді, бірақ қайталамағандықтан ұмытты. Қай қабілетті дамыту керек?",
    a: "Мұхафазаны: білімді бекіту, қайталау және есте сақтау."
  },
  {
    q: "Абай уайымсыз салғырттықты неліктен қауіпті деп есептейді?",
    a: "Ол адамды білімге, міндетке, ой еңбегіне немқұрайды қарауға итермелейді."
  },
  {
    q: "Салғырттықтан сақтануды пайдалы демалыспен шатастыруға бола ма?",
    a: "Болмайды. Демалыс күш жинауға қажет, ал салғырттық — мақсатқа немқұрайды қарау."
  },
  {
    q: "«Мінез — сауыт» метафорасын талдап бер.",
    a: "Сауыт қорғаушы құрал ретінде алынған. Берік мінез ақыл мен білімді орынсыз ықпалдан қорғайды деген ой беріледі."
  },
  {
    q: "Алтыншы шарттағы қайрат пен ар ұғымдары қалай байланысады?",
    a: "Қайрат адамның шешімін іске асыруға, ал ар әрекетті адамгершілікке сай таңдауға көмектеседі."
  },
  {
    q: "Абай сынайтын көрсеқызарлық білім алуға қалай әсер етуі мүмкін?",
    a: "Адам тұрақты мақсаттан жиі ауытқып, күшін кездейсоқ қызықтарға шашыратып жіберуі мүмкін."
  },
  {
    q: "Шығармадағы дидактикалық сипат қалай көрінеді?",
    a: "Автор оқырманға нақты шарттар қойып, ненің пайдалы, ненің зиян екенін түсіндіреді."
  },
  {
    q: "32-қара сөздің 31-қара сөздегі есте сақтау мәселесімен байланысын түсіндір.",
    a: "31-сөзде естігенді ұмытпаудың себептері айтылса, 32-сөзде мұлахаза мен мұхафаза арқылы білімді нығайту ойы жалғасады."
  },
  {
    q: "Шығармадағы ең маңызды ойды үш дәлелмен қорға.",
    a: "Мысалы, шын ықылас оқу мотивациясын, ақиқатшылдық дұрыс қорытындыны, берік мінез үздіксіз еңбекті қолдайды."
  },
  {
    q: "Абайдың алты шартына сүйеніп, қазіргі білім алушыға үш нақты кеңес бер.",
    a: "Қызығып оқы, пікіріңді дерекпен тексер, үйренгеніңді ой елегінен өткізіп қайтала және жоспарға адал бол."
  }
];

// ===============================================
// 10. 24 КҮРДЕЛІ ЖЕКЕ ТЕСТ
// ===============================================

const QUIZ = [
  {
    q: "Отыз екінші қара сөздің негізгі тақырыбы қандай?",
    options: [
      "Табиғаттың төрт мезгілі",
      "Ғылым үйренудің шарттары",
      "Жорық тарихы",
      "Қала құрылысы"
    ],
    answer: 1,
    why: "Шығарма білім-ғылым үйренуге қажетті шарттарды түсіндіреді."
  },
  {
    q: "Абай бірінші шартта нені жоғары қояды?",
    options: [
      "Атақ үшін оқуды",
      "Біреуді жеңуді",
      "Білімнің өзіне құмарлықты",
      "Білімді еш қолданбауды"
    ],
    answer: 2,
    why: "Абай білуге шын ынтық болуды насихаттайды."
  },
  {
    q: "«Білмектіктің өзін дәулет білу» нені білдіреді?",
    options: [
      "Білімді құндылық деп тану",
      "Тек ақша табу",
      "Үйренуден бас тарту",
      "Дауласуды жақсы көру"
    ],
    answer: 0,
    why: "Жаңа білім алудың өзін үлкен жетістік деп бағалау қажет."
  },
  {
    q: "Қай әрекет екінші шартқа көбірек сәйкес келеді?",
    options: [
      "Дәлелді жасыру",
      "Қарсыласты келемеждеу",
      "Қате болса да өз пікірін ұстану",
      "Дерекке сүйеніп, ақиқатты анықтау"
    ],
    answer: 3,
    why: "Абай ғылыми талқылаудың ақиқатқа бағытталуын қалайды."
  },
  {
    q: "Абай сынайтын бахас қандай?",
    options: [
      "Дәлел іздейтін талқылау",
      "Жеңуді ғана мақсат еткен айтыс",
      "Сыпайы пікір алмасу",
      "Ортақ қорытынды жасау"
    ],
    answer: 1,
    why: "Тек жеңу үшін дауласу шындықты іздеуге кедергі болады."
  },
  {
    q: "Үшінші шарттың түйіні қайсы?",
    options: [
      "Білгенді өмірде ұстану",
      "Кез келген пікірге соқыр сену",
      "Білімнен бас тарту",
      "Өзгені тыңдамау"
    ],
    answer: 0,
    why: "Дұрыс деп таныған білім адамның әрекетіне әсер етуі тиіс."
  },
  {
    q: "«Мұлахаза» сөзіне ең жақын мағына қайсы?",
    options: [
      "Ұмыту",
      "Мақтану",
      "Ой елегінен өткізу",
      "Кездейсоқ таңдау"
    ],
    answer: 2,
    why: "Мұлахаза — терең пайымдау және ойлану."
  },
  {
    q: "«Мұхафаза» ұғымы нені білдіреді?",
    options: [
      "Тек дауласуды",
      "Білгенді есте сақтау мен бекітуді",
      "Уақытты бос өткізуді",
      "Жеңіл қызыққа ертуді"
    ],
    answer: 1,
    why: "Мұхафаза білімді сақтауға қатысты."
  },
  {
    q: "Абай білімді көбейтудің қандай екі құралын атайды?",
    options: [
      "Бедел мен атақ",
      "Күш пен байлық",
      "Дау мен мақтан",
      "Мұлахаза мен мұхафаза"
    ],
    answer: 3,
    why: "Төртінші шартта осы екі қабілет аталады."
  },
  {
    q: "Студент мәтінді түсінбей жаттады. Қай қабілеті жеткіліксіз іске қосылды?",
    options: [
      "Мұлахаза",
      "Көрсеқызарлық",
      "Бахас",
      "Салғырттық"
    ],
    answer: 0,
    why: "Тақырыпты терең түсіну үшін ой елегінен өткізу қажет."
  },
  {
    q: "Түсінгенін тез ұмытатын оқушыға қай тәсіл пайдалы?",
    options: [
      "Бір рет қана оқу",
      "Тек дауласу",
      "Қайталап, есте бекіту",
      "Тапсырманы орындамау"
    ],
    answer: 2,
    why: "Мұхафаза қабілетін қайталау мен қолдану нығайтады."
  },
  {
    q: "Абай бесінші шартта әсіресе неден сақтандырады?",
    options: [
      "Кітап оқудан",
      "Уайымсыз салғырттықтан",
      "Пайдалы еңбектен",
      "Ойланудан"
    ],
    answer: 1,
    why: "Салғырттық білімге кедергі болатын ой кеселдерінің бірі."
  },
  {
    q: "Мақсатқа немқұрайды қарау қай қасиетті сипаттайды?",
    options: [
      "Ықыласты",
      "Қайратты",
      "Мұхафазаны",
      "Салғырттықты"
    ],
    answer: 3,
    why: "Салғырттық адамның жауапкершілігін әлсіретеді."
  },
  {
    q: "Абай білім мен ақылды сақтайтын нені сауытқа теңейді?",
    options: [
      "Мінезді",
      "Киімді",
      "Байлықты",
      "Дауысты"
    ],
    answer: 0,
    why: "Мінездің беріктігі ақыл мен білімді сақтауға көмектеседі."
  },
  {
    q: "«Мінез — сауыт» қандай көркемдік құрал?",
    options: [
      "Тек дыбыс қайталау",
      "Гипербола",
      "Метафора",
      "Ұйқас"
    ],
    answer: 2,
    why: "Мінезді сауыт бейнесіне ауыстырып сипаттау — метафора."
  },
  {
    q: "Алтыншы шартқа сәйкес келетін әрекетті таңда.",
    options: [
      "Кез келген қызыққа еріп кету",
      "Мақсатқа адал, табанды болу",
      "Жауапкершілікті елемеу",
      "Білімді бағаламау"
    ],
    answer: 1,
    why: "Абай қайрат пен мінездің беріктігін жоғары қояды."
  },
  {
    q: "Абайдың ғылымға қатынасы қай пікірге жақын?",
    options: [
      "Ғылым тек байларға керек",
      "Білім қажет емес",
      "Оқығанның бәрі міндетті түрде жеңеді",
      "Ғылым шын ниетпен үйренілуі керек"
    ],
    answer: 3,
    why: "Абай білімнің өзіне ықыласпен ұмтылуды қолдайды."
  },
  {
    q: "Қайсысы шығарманың дидактикалық сипатын көрсетеді?",
    options: [
      "Оқырманға нақты ақыл-кеңес беру",
      "Тек табиғатты бейнелеу",
      "Тек кейіпкерлер диалогын беру",
      "Сахна көрінісін сипаттау"
    ],
    answer: 0,
    why: "Шығарма ғылым үйрену шарттарын түсіндіріп, тәрбие береді."
  },
  {
    q: "Абайдың екінші шартымен қай қасиет үйлеспейді?",
    options: [
      "Дәлелді тыңдау",
      "Қатені түзету",
      "Мақтан үшін дауласу",
      "Шындықты іздеу"
    ],
    answer: 2,
    why: "Абай ақиқаттан гөрі жеңуді мақсат етуді сынайды."
  },
  {
    q: "Отыз екінші сөз қай жанрға жатады?",
    options: [
      "Драмалық пьеса",
      "Философиялық прозалық қара сөз",
      "Ертегі",
      "Дастан"
    ],
    answer: 1,
    why: "Бұл — философиялық, ғибраттық прозалық шығарма."
  },
  {
    q: "Ғылым үйренудің алты шартының қайсысы ой мен жадты қатар дамытуды айтады?",
    options: [
      "Бірінші",
      "Екінші",
      "Алтыншы",
      "Төртінші"
    ],
    answer: 3,
    why: "Төртінші шартта мұлахаза мен мұхафаза аталады."
  },
  {
    q: "«Өз қатесін сенімді дәлелмен түзету» қандай ұстаным?",
    options: [
      "Ақиқатқа адалдық",
      "Көрсеқызарлық",
      "Салғырттық",
      "Бос бахас"
    ],
    answer: 0,
    why: "Ақиқатты құрметтеу жаңа дәлелді мойындай білуді де білдіреді."
  },
  {
    q: "31-сөз бен 32-сөздің ортақ мәселелерінің бірі?",
    options: [
      "Кино өнері",
      "Сауда жолдары",
      "Білімді ұғып, есте сақтау",
      "Табиғат құбылысы"
    ],
    answer: 2,
    why: "Екі сөзде де ой мен білімді сақтауға көңіл бөлінеді."
  },
  {
    q: "Абайдың алты шартын жинақтайтын ең дәл қорытынды?",
    options: [
      "Білімді тек баға үшін үйрен",
      "Ықыласпен үйрен, ойлан, ақиқатты ұстан, мінезіңді бекіт",
      "Көбірек даулассаң жеткілікті",
      "Үйренгенді қайталама"
    ],
    answer: 1,
    why: "Осы ойлар отыз екінші қара сөздің негізгі мазмұнын біріктіреді."
  }
];

// ===============================================
// 11. РАНДОМ СҰРАҚТАРДЫ ҚАЙТАЛАМАУ
// ===============================================

function remainingStudents(results) {
  return presentStudents().filter(
    s => !has(results, s.id)
  );
}

function availableQuestionIndices(bank, results) {
  const used = new Set(
    Object.values(results)
      .map(r => r.questionIndex)
      .filter(Number.isInteger)
  );

  const pending = [
    state.oralSelected,
    state.quizSelected
  ];

  // Бір тапсырма кезеңіндегі аяқталмаған
  // сұрақты да қайталамауға дайындаймыз.
  return bank.map((_, index) => index)
    .filter(index => !used.has(index));
}

function chooseRandomTask(type, bank) {
  const current = type === "oral"
    ? state.oralSelected
    : state.quizSelected;

  if (
    current &&
    presentStudents().some(
      s => s.id === current.studentId
    ) &&
    !has(state[type], current.studentId)
  ) {
    return false;
  }

  const students =
    remainingStudents(state[type]);

  const questions =
    availableQuestionIndices(
      bank,
      state[type]
    );

  const key = type === "oral"
    ? "oralSelected"
    : "quizSelected";

  if (!students.length || !questions.length) {
    state[key] = null;
    save();
    return true;
  }

  state[key] = {
    studentId: randomFrom(students).id,
    questionIndex: randomFrom(questions)
  };

  save();
  return true;
}

// ===============================================
// 12. АУЫЗША СҰРАҚ
// ===============================================

function renderOral() {
  const active = presentStudents();
  const remaining = remainingStudents(state.oral);

  const selection = state.oralSelected;

  const student = selection
    ? active.find(
        s => s.id === selection.studentId
      )
    : null;

  const selected = Boolean(student);
  const graded =
    selected && has(state.oral, student.id);

  $("oralProgress").textContent =
    `${active.length - remaining.length} / ` +
    `${active.length} бағаланды`;

  $("oralPick").disabled =
    !remaining.length ||
    (selected && !graded);

  $("oralReveal").disabled = !selected;

  document.querySelectorAll(".oral-grade")
    .forEach(btn => {
      btn.disabled = !selected || graded;
    });

  if (!selected) {
    $("oralStudent").textContent =
      active.length
        ? "🎲 Рандом оқушы"
        : "Қатысушылар жоқ";

    $("oralQuestion").textContent =
      remaining.length
        ? "Рандом таңдау батырмасын бас."
        : "Барлық оқушы бағаланды.";

    $("oralAnswer").textContent = "";
    $("oralAnswer").hidden = true;

    $("oralFeedback").textContent =
      `${remaining.length} оқушы қалды.`;
  } else {
    const item = ORAL[selection.questionIndex];

    $("oralStudent").textContent =
      "🎤 " + student.name;

    $("oralQuestion").textContent =
      item.q;

    $("oralAnswer").textContent =
      "Жауап үлгісі: " + item.a;

    $("oralAnswer").hidden = !graded;

    $("oralFeedback").textContent = graded
      ? `${student.name}: ` +
        `${state.oral[student.id].points}/3 ұпай`
      : "Жауабын тыңдап, 0–3 ұпай қой.";
  }

  $("oralResults").innerHTML =
    active.map(s => `
      <div class="result-person">
        <span>${esc(s.name)}</span>
        <b>
          ${has(state.oral, s.id)
            ? state.oral[s.id].points + " / 3"
            : "Кезекте"}
        </b>
      </div>
    `).join("");
}

$("oralPick").addEventListener(
  "click",
  () => {
    const chosen = chooseRandomTask(
      "oral",
      ORAL
    );

    if (!chosen) {
      $("oralFeedback").textContent =
        "Алдымен таңдалған оқушыға баға қой.";
      return;
    }

    renderOral();
  }
);

$("oralReveal").addEventListener(
  "click",
  () => {
    if (!state.oralSelected) return;

    $("oralAnswer").hidden =
      !$("oralAnswer").hidden;
  }
);

document.querySelectorAll(".oral-grade")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = state.oralSelected;
      if (!selected) return;

      const id = selected.studentId;

      if (
        has(state.oral, id) ||
        !presentStudents().some(
          s => s.id === id
        )
      ) return;

      state.oral[id] = {
        questionIndex: selected.questionIndex,
        points: Number(btn.dataset.score)
      };

      save();
      renderOral();
      renderScores();
    });
  });

// ===============================================
// 13. ЖЕКЕ ТЕСТ
// ===============================================

function renderQuiz() {
  const active = presentStudents();
  const remaining = remainingStudents(state.quiz);

  const selection = state.quizSelected;

  const student = selection
    ? active.find(
        s => s.id === selection.studentId
      )
    : null;

  const selected = Boolean(student);
  const done =
    selected && has(state.quiz, student.id);

  $("quizProgress").textContent =
    `${active.length - remaining.length} / ` +
    `${active.length} тапсырды`;

  $("quizPick").disabled =
    !remaining.length ||
    (selected && !done);

  $("quizCheck").disabled =
    !selected || done;

  if (!selected) {
    $("quizStudent").textContent =
      active.length
        ? "🎲 Рандом оқушы"
        : "Қатысушылар жоқ";

    $("quizQuestion").textContent =
      remaining.length
        ? "Рандом таңдау батырмасын бас."
        : "Жеке тест аяқталды.";

    $("quizOptions").innerHTML = "";

    $("quizFeedback").textContent =
      `${remaining.length} оқушы қалды.`;
  } else {
    const item = QUIZ[selection.questionIndex];
    const result = state.quiz[student.id];

    $("quizStudent").textContent =
      "🧠 " + student.name;

    $("quizQuestion").textContent = item.q;

    $("quizOptions").innerHTML =
      item.options.map((option, index) => {
        const checked =
          done && result.selected === index;

        const className = done
          ? index === item.answer
            ? "correct"
            : checked ? "wrong" : ""
          : "";

        return `
          <label class="choice ${className}">
            <input
              type="radio"
              name="quizAnswer"
              value="${index}"
              ${checked ? "checked" : ""}
              ${done ? "disabled" : ""}>

            <span>
              ${String.fromCharCode(65 + index)}.
              ${esc(option)}
            </span>
          </label>
        `;
      }).join("");

    $("quizFeedback").textContent = done
      ? (result.correct ? "✅ Дұрыс! " : "❌ Қате. ") +
        item.why
      : "Дұрыс жауапты таңда.";
  }

  $("quizResults").innerHTML =
    active.map(s => `
      <div class="result-person">
        <span>${esc(s.name)}</span>

        <b>
          ${has(state.quiz, s.id)
            ? state.quiz[s.id].points + " / 2"
            : "Кезекте"}
        </b>
      </div>
    `).join("");
}

$("quizPick").addEventListener(
  "click",
  () => {
    const chosen = chooseRandomTask(
      "quiz",
      QUIZ
    );

    if (!chosen) {
      $("quizFeedback").textContent =
        "Алдымен ағымдағы тестті тексер.";
      return;
    }

    renderQuiz();
  }
);

$("quizCheck").addEventListener(
  "click",
  () => {
    const selection = state.quizSelected;
    if (!selection) return;

    const id = selection.studentId;

    if (
      has(state.quiz, id) ||
      !presentStudents().some(
        s => s.id === id
      )
    ) return;

    const answerField = document.querySelector(
      'input[name="quizAnswer"]:checked'
    );

    if (!answerField) {
      $("quizFeedback").textContent =
        "Алдымен жауап нұсқасын таңда.";
      return;
    }

    const answer = Number(answerField.value);
    const question = QUIZ[selection.questionIndex];

    const correct =
      answer === question.answer;

    state.quiz[id] = {
      questionIndex: selection.questionIndex,
      selected: answer,
      correct,
      points: correct ? 2 : 0
    };

    save();
    renderQuiz();
    renderScores();
  }
);

// ===============================================
// 14. 1-ОЙЫН — ҒЫЛЫМИ ЖАҒДАЯТТАР
// ===============================================

const BATTLE = [
  {
    q: "Бір студент Абай сөзін жатқа айтады, бірақ мағынасын түсіндірмейді. Қай қабілет жеткіліксіз?",
    options: [
      "Мұхафаза",
      "Мұлахаза",
      "Көрсеқызарлық",
      "Мақтан"
    ],
    answer: 1,
    why: "Мұлахаза — ақпаратты зерделеп, мағынасын түсіну."
  },
  {
    q: "Студент ғылыми пікірталаста өз қатесін түсінді, бірақ бедел үшін мойындамады. Бұл қай шартқа қайшы?",
    options: [
      "Бірінші шарт",
      "Алтыншы шарт қана",
      "Ақиқат үшін үйрену шарты",
      "Төртінші шарт қана"
    ],
    answer: 2,
    why: "Екінші шарт ақиқатты жеке жеңістен жоғары қоюға шақырады."
  },
  {
    q: "Оқушы жыл бойы жүйелі оқиды, әлеуметтік желідегі әр қызыққа алаңдамайды. Қай метафораға жақын?",
    options: [
      "Мінездің сауыты",
      "Бос бахас",
      "Шала мейір",
      "Уайымсыз салғырттық"
    ],
    answer: 0,
    why: "Мінездің беріктігі мақсатқа тұрақты ұмтылумен байланысты."
  },
  {
    q: "Студент жаңа нәрсені үйренгенде қуанып, тағы ізденгісі келеді. Бұл қай шарт?",
    options: [
      "Бесінші",
      "Төртінші",
      "Үшінші",
      "Бірінші"
    ],
    answer: 3,
    why: "Бірінші шарт — білімге шынайы құштарлық."
  },
  {
    q: "Тақырыпты түсінген оқушы оны қайталамағандықтан ұмытты. Қай қабілетті күшейту керек?",
    options: [
      "Бахасты",
      "Мұхафазаны",
      "Салғырттықты",
      "Көрсеқызарлықты"
    ],
    answer: 1,
    why: "Мұхафаза білімді жадыда бекітуге қатысты."
  },
  {
    q: "Екі топ пікір таластырды: бірі айқайлады, екіншісі дерек ұсынды. Абайға сай жол қайсы?",
    options: [
      "Айқайлаған топ",
      "Ешкімді тыңдамау",
      "Дерекпен дәлелдеу",
      "Қарсыласты кемсіту"
    ],
    answer: 2,
    why: "Ғылыми талқылауда ақиқат пен дәлел маңызды."
  },
  {
    q: "Оқушы адалдықтың маңызды екенін біледі, бірақ әрекетінде сақтамайды. Қай шарт орындалмады?",
    options: [
      "Үшінші",
      "Тек бірінші",
      "Тек төртінші",
      "Ешқайсысы"
    ],
    answer: 0,
    why: "Үшінші шарт білген ақиқатты өмірде ұстануға шақырады."
  },
  {
    q: "Абайдың «сауыт» бейнесі әдеби талдауда не болып саналады?",
    options: [
      "Тұрақты өлшем",
      "Ұйқас",
      "Дыбыстық қайталау",
      "Метафора"
    ],
    answer: 3,
    why: "Мінезді сауытқа теңеп бейнелеу — метафора."
  },
  {
    q: "Қай оқу жоспары Абайдың бірнеше шартына бірдей сәйкес келеді?",
    options: [
      "Көшіріп алу және тез ұмыту",
      "Қызығып оқу, ойлану, қайталау, дәлелді қабылдау",
      "Тек баға үшін жаттау",
      "Тек дауласу"
    ],
    answer: 1,
    why: "Бұл жоспар ықыласты, мұлахазаны, мұхафазаны және ақиқатшылдықты біріктіреді."
  }
];

let activeGame = 0;

function changeGame(game) {
  game = Number(game);

  if (
    !Number.isInteger(game) ||
    game < 0 ||
    game > 2
  ) return;

  activeGame = game;

  document.querySelectorAll(".game-tab")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.game) === game
      );
    });

  for (let i = 0; i < 3; i++) {
    $("game-" + i).classList.toggle(
      "active",
      i === game
    );
  }
}

document.querySelectorAll(".game-tab")
  .forEach(btn => {
    btn.addEventListener("click", () => {
      changeGame(Number(btn.dataset.game));
    });
  });

function battleLength() {
  return teamCount() * 3;
}

function battleTeam(index) {
  return teamCount()
    ? index % teamCount()
    : -1;
}

function renderBattle() {
  const length = battleLength();

  if (!length) {
    $("battleProgress").textContent = "0 / 0";
    $("battleTeam").textContent = "";
    $("battleQuestion").textContent =
      "Алдымен қатысушыларды белгіле.";

    $("battleOptions").innerHTML = "";
    $("battleBar").style.width = "0%";

    $("battleCheck").disabled = true;
    $("battleNext").disabled = true;
    $("battleFeedback").textContent = "";
    return;
  }

  const index = Math.max(
    0,
    Math.min(
      length - 1,
      Number(state.battleIndex) || 0
    )
  );

  state.battleIndex = index;

  const item = BATTLE[index];
  const done = has(state.battle, index);
  const result = state.battle[index];

  $("battleProgress").textContent =
    `${index + 1} / ${length}`;

  $("battleTeam").textContent =
    TEAM_NAMES[battleTeam(index)];

  $("battleQuestion").textContent =
    item.q;

  $("battleBar").style.width =
    ((index + 1) / length * 100) + "%";

  $("battleOptions").innerHTML =
    item.options.map((option, i) => {
      const checked =
        done && result.selected === i;

      const className = done
        ? i === item.answer
          ? "correct"
          : checked ? "wrong" : ""
        : "";

      return `
        <label class="choice ${className}">
          <input
            type="radio"
            name="battleAnswer"
            value="${i}"
            ${checked ? "checked" : ""}
            ${done ? "disabled" : ""}>

          <span>
            ${String.fromCharCode(65 + i)}.
            ${esc(option)}
          </span>
        </label>
      `;
    }).join("");

  $("battleCheck").disabled = done;
  $("battleNext").disabled = false;

  $("battleNext").textContent =
    index === length - 1
      ? "2-ойынға өту →"
      : "Келесі жағдаят →";

  $("battleFeedback").textContent = done
    ? (result.correct ? "✅ Дұрыс! " : "❌ Қате. ") +
      item.why
    : "Командамен талқылап, жауап таңдаңдар.";
}

$("battleCheck").addEventListener(
  "click",
  () => {
    const index = state.battleIndex;

    if (
      !teamCount() ||
      index >= battleLength() ||
      has(state.battle, index)
    ) return;

    const selected = document.querySelector(
      'input[name="battleAnswer"]:checked'
    );

    if (!selected) {
      $("battleFeedback").textContent =
        "Жауапты таңда.";
      return;
    }

    const answer = Number(selected.value);
    const correct =
      answer === BATTLE[index].answer;

    state.battle[index] = {
      selected: answer,
      correct,
      points: correct ? 3 : 0
    };

    save();
    renderBattle();
    renderScores();
  }
);

$("battleNext").addEventListener(
  "click",
  () => {
    if (!teamCount()) return;

    if (
      state.battleIndex >= battleLength() - 1
    ) {
      changeGame(1);
      return;
    }

    state.battleIndex++;
    save();
    renderBattle();
  }
);

// ===============================================
// 15. 2-ОЙЫН — АҚИҚАТ ДЕТЕКТИВІ
// ===============================================

const LOGIC = [
  [
    {
      text: "Абай ғылымды үйренуде шын ықыласты жоғары қояды.",
      correct: true,
      why: "Бірінші шарт білімнің өзіне құмар болуды түсіндіреді."
    },
    {
      text: "Абай ғылымды тек қарсыласын жеңу үшін үйренуді ұсынады.",
      correct: false,
      why: "Екінші шарт мұндай мақсатты сынайды."
    },
    {
      text: "Білімнің өзін құндылық деп тану — бірінші шарттың маңызды ойы.",
      correct: true,
      why: "Абай білмектіктің өзін дәулет көруді айтады."
    },
    {
      text: "Отыз екінші қара сөз тек табиғат көріністерін сипаттайды.",
      correct: false,
      why: "Шығарма білім алудың адамгершілік шарттарына арналған."
    }
  ],

  [
    {
      text: "Мұлахаза — ой елегінен өткізу, зерделеу.",
      correct: true,
      why: "Бұл — түсіну мен пайымдауға қатысты ұғым."
    },
    {
      text: "Мұхафаза — үйренгенді есте сақтау.",
      correct: true,
      why: "Мұхафаза білімді жадыда бекітумен байланысты."
    },
    {
      text: "Ақиқатқа адал болу қатені ешқашан мойындамау деген сөз.",
      correct: false,
      why: "Шындыққа адалдық жаңа сенімді дәлелді қабылдауды талап етеді."
    },
    {
      text: "Пікірталастың мақсаты тек жеңу болса, ғылымға зияны болуы мүмкін.",
      correct: true,
      why: "Абай жеңу үшін ғана жасалған бахасты сынайды."
    }
  ],

  [
    {
      text: "Абай мінезді білім мен ақылды сақтайтын сауытқа теңейді.",
      correct: true,
      why: "Бұл — алтыншы шарттағы маңызды метафора."
    },
    {
      text: "Уайымсыз салғырттық білімге еш кедергі келтірмейді.",
      correct: false,
      why: "Бесінші шартта салғырттықтан сақтану айтылады."
    },
    {
      text: "Отыз екінші қара сөзде алты негізгі шарт бар.",
      correct: true,
      why: "Мәтінде бірінші шарттан алтыншы шартқа дейін кеңес берілген."
    },
    {
      text: "Абай білімге қызығудан гөрі мақтанды жоғары бағалайды.",
      correct: false,
      why: "Абай білімге шын ықылас пен ақиқатты бағалауды ұсынады."
    }
  ]
];

function renderLogic() {
  if (!teamCount()) {
    $("logicArea").innerHTML =
      '<div class="card">Қатысушылар жоқ.</div>';
    return;
  }

  $("logicArea").innerHTML =
    LOGIC.slice(0, teamCount())
      .map((items, team) => {
        const result = state.logic[team];
        const done = Boolean(result);

        const rows = items.map((item, i) => {
          const value = done
            ? String(result.answers[i])
            : "";

          return `
            <div class="statement">
              <p>
                <b>${i + 1}.</b>
                ${esc(item.text)}
              </p>

              <select
                data-logic="${team}-${i}"
                ${done ? "disabled" : ""}>

                <option value="">Таңдау</option>

                <option
                  value="true"
                  ${value === "true" ? "selected" : ""}>
                  ✅ Дұрыс
                </option>

                <option
                  value="false"
                  ${value === "false" ? "selected" : ""}>
                  ❌ Қате
                </option>

              </select>
            </div>
          `;
        }).join("");

        const explanations = done
          ? items.map((item, i) => `
              <p>
                ${i + 1}.
                <b>
                  ${result.answers[i] === item.correct
                    ? "✅"
                    : "❌"}
                </b>
                ${esc(item.why)}
              </p>
            `).join("")
          : "";

        return `
          <div class="logic-card">
            <h3>${TEAM_NAMES[team]}</h3>

            <p>
              Төрт тұжырымды талдап,
              дұрыс немесе қате екенін
              анықтаңдар.
            </p>

            ${rows}

            <button
              class="btn primary"
              data-logic-check="${team}"
              ${done ? "disabled" : ""}>
              🕵️ Тексеру
            </button>

            <p class="feedback"
               id="logicFeedback-${team}">
              ${done
                ? `${result.points} / 4 ұпай`
                : ""}
            </p>

            ${done
              ? `<div class="answer-box">
                   ${explanations}
                 </div>`
              : ""}
          </div>
        `;
      }).join("");

  document.querySelectorAll("[data-logic-check]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const team = Number(
          btn.dataset.logicCheck
        );

        if (has(state.logic, team)) return;

        const items = LOGIC[team];

        const fields = items.map((_, i) =>
          document.querySelector(
            `[data-logic="${team}-${i}"]`
          )
        );

        if (
          fields.some(field => field.value === "")
        ) {
          $("logicFeedback-" + team).textContent =
            "Төрт жауапты түгел таңдаңдар.";
          return;
        }

        const answers = fields.map(
          field => field.value === "true"
        );

        const points = answers.reduce(
          (sum, answer, i) =>
            sum + Number(
              answer === items[i].correct
            ),
          0
        );

        state.logic[team] = {
          answers,
          points
        };

        save();
        renderLogic();
        renderScores();
      });
    });
}

// ===============================================
// 16. 3-ОЙЫН — ШЫҒАРМАШЫЛЫҚ ЖҰМЫС
// ===============================================

const CREATIVE = [
  {
    title: "📜 Бірінші команда: Мәтін талдаушы",
    task:
      "Абайдың бірінші және екінші " +
      "шарттарын салыстыратын шағын " +
      "кесте құрастырыңдар. " +
      "Бір жағында білімге шынайы " +
      "ынтық адамды, екінші жағында " +
      "тек бедел үшін оқитын " +
      "адамды сипаттаңдар. " +
      "Қорытындыны екі дәлелмен қорғаңдар.",
    rubric:
      "2 ұпай — мәтінді дұрыс түсіну; " +
      "2 ұпай — салыстыру; " +
      "1 ұпай — дәлелді қорытынды."
  },
  {
    title: "🧠 Екінші команда: Ой зертханасы",
    task:
      "Мұлахаза мен мұхафазаның " +
      "айырмашылығын көрсететін " +
      "сызба салыңдар. " +
      "Содан кейін жаңа тақырыпты " +
      "үйренудің бес қадамдық " +
      "жоспарын жасаңдар. " +
      "Неліктен бұл жоспар нәтижелі " +
      "болатынын түсіндіріңдер.",
    rubric:
      "2 ұпай — ұғымдарды түсіндіру; " +
      "2 ұпай — оқу жоспары; " +
      "1 ұпай — ғылыми негіздеме."
  },
  {
    title: "🛡️ Үшінші команда: Мінез сауыты",
    task:
      "Дәптерге немесе А4 қағазына " +
      "үлкен сауыт сызбасын жасаңдар. " +
      "Оның ішіне Абай жоғары " +
      "бағалаған бес қасиетті жазыңдар. " +
      "Сыртына білімге кедергі " +
      "келтіретін әрекеттерді орналастырыңдар. " +
      "Метафораны қорғаңдар.",
    rubric:
      "2 ұпай — шығармамен байланыс; " +
      "2 ұпай — көркем әрі логикалық сызба; " +
      "1 ұпай — түсіндіру."
  }
];

function renderCreative() {
  if (!teamCount()) {
    $("creativeArea").innerHTML =
      '<div class="card">Қатысушылар жоқ.</div>';
    return;
  }

  $("creativeArea").innerHTML =
    CREATIVE.slice(0, teamCount())
      .map((task, team) => {
        const score = has(state.creative, team)
          ? state.creative[team]
          : null;

        return `
          <div class="creative-card">
            <h3>${TEAM_NAMES[team]}</h3>
            <h3>${esc(task.title)}</h3>

            <p>${esc(task.task)}</p>

            <p>
              <b>Бағалау өлшемі:</b>
              ${esc(task.rubric)}
            </p>

            <label for="creative-${team}">
              Команданың ұпайы:
            </label>

            <select id="creative-${team}">
              <option value="">Ұпай таңда</option>

              ${[0, 1, 2, 3, 4, 5]
                .map(n => `
                  <option value="${n}"
                    ${score === n
                      ? "selected"
                      : ""}>
                    ${n} ұпай
                  </option>
                `).join("")}
            </select>

            <button
              class="btn success"
              data-creative-save="${team}">
              🏅 Ұпайды сақтау
            </button>

            <p class="feedback"
               id="creativeFeedback-${team}">
              ${score === null
                ? "Әлі бағаланған жоқ."
                : `${score} / 5 ұпай сақталды.`}
            </p>
          </div>
        `;
      }).join("");

  document.querySelectorAll("[data-creative-save]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        const team = Number(
          btn.dataset.creativeSave
        );

        const value =
          $("creative-" + team).value;

        if (value === "") {
          $("creativeFeedback-" + team).textContent =
            "Алдымен ұпай таңда.";
          return;
        }

        state.creative[team] = Number(value);

        save();
        renderCreative();
        renderScores();
      });
    });
}

// ===============================================
// 17. ҰПАЙ ЕСЕПТЕУ
// ===============================================

function personalPoints(id) {
  const oral = has(state.oral, id)
    ? Number(state.oral[id].points) || 0
    : 0;

  const quiz = has(state.quiz, id)
    ? Number(state.quiz[id].points) || 0
    : 0;

  return oral + quiz;
}

function gamePoints(team) {
  let points = 0;

  for (let i = 0; i < battleLength(); i++) {
    if (
      battleTeam(i) === team &&
      has(state.battle, i)
    ) {
      points +=
        Number(state.battle[i].points) || 0;
    }
  }

  if (has(state.logic, team)) {
    points +=
      Number(state.logic[team].points) || 0;
  }

  if (has(state.creative, team)) {
    points +=
      Number(state.creative[team]) || 0;
  }

  return points;
}

function teamPoints(team) {
  const members = teamMembers(team);

  if (!members.length) return 0;

  const sum = members.reduce(
    (total, student) =>
      total + personalPoints(student.id),
    0
  );

  // Топтардағы оқушылар саны
  // әртүрлі болғанда әділдеу
  // салыстыру үшін орташа ұпай.

  const average = sum / members.length;

  return Math.round(average * 2) +
    gamePoints(team);
}

function teamScoreCards() {
  return TEAM_NAMES.slice(0, teamCount())
    .map((name, team) => `
      <div class="team-card">
        <h3>${name}</h3>

        <div class="team-score">
          ${teamPoints(team)} ұпай
        </div>

        <p>
          ${teamMembers(team).length} оқушы
        </p>

        <p>
          Командалық ойындар:
          ${gamePoints(team)} ұпай
        </p>
      </div>
    `).join("");
}

function renderScores() {
  const cards = teamScoreCards();

  $("gameScores").innerHTML = cards;
  $("finalScores").innerHTML = cards;

  $("sidebarScores").innerHTML =
    state.page < 11
      ? ""
      : TEAM_NAMES.slice(0, teamCount())
          .map((name, team) => `
            <div class="mini-score">
              <span>${name}</span>
              <b>${teamPoints(team)}</b>
            </div>
          `).join("");

  renderFinal();
}

// ===============================================
// 18. ҚОРЫТЫНДЫ ЖӘНЕ ЖЕҢІМПАЗ
// ===============================================

function allGamesCompleted() {
  if (!teamCount()) return false;

  const battleDone =
    Array.from(
      { length: battleLength() },
      (_, i) => i
    ).every(i => has(state.battle, i));

  const otherGamesDone =
    Array.from(
      { length: teamCount() },
      (_, i) => i
    ).every(team =>
      has(state.logic, team) &&
      has(state.creative, team)
    );

  return battleDone && otherGamesDone;
}

function renderFinal() {
  const active = presentStudents();

  if (!active.length) {
    $("winner").textContent =
      "Қатысушылар белгіленген жоқ.";

    $("studentResults").innerHTML = "";
    return;
  }

  const scores = Array.from(
    { length: teamCount() },
    (_, team) => teamPoints(team)
  );

  const highest = Math.max(...scores);

  const leaders = scores
    .map((score, index) => ({
      score,
      index
    }))
    .filter(item => item.score === highest);

  const anyResults =
    active.some(s =>
      has(state.oral, s.id) ||
      has(state.quiz, s.id)
    ) ||
    gamesStarted();

  if (!anyResults) {
    $("winner").textContent =
      "Нәтижелер тапсырмалардан кейін шығады.";
  } else if (leaders.length === 1) {
    $("winner").innerHTML =
      (allGamesCompleted()
        ? "🏆 ЖЕҢІМПАЗ КОМАНДА"
        : "📊 ӘЗІРГЕ КӨШБАСШЫ") +
      "<br>" +
      TEAM_NAMES[leaders[0].index] +
      "<br>" +
      highest + " ұпай";
  } else {
    $("winner").innerHTML =
      (allGamesCompleted()
        ? "🤝 ҚОРЫТЫНДЫ ҰПАЙ ТЕҢ"
        : "📊 ӘЗІРГЕ ҰПАЙ ТЕҢ") +
      "<br>" +
      leaders.map(item =>
        TEAM_NAMES[item.index]
      ).join(" және ") +
      "<br>" +
      highest + " ұпай";
  }

  $("studentResults").innerHTML =
    active.map(s => {
      const oral = has(state.oral, s.id)
        ? state.oral[s.id].points
        : "—";

      const quiz = has(state.quiz, s.id)
        ? state.quiz[s.id].points
        : "—";

      return `
        <tr>
          <td>${esc(s.name)}</td>

          <td>${TEAM_NAMES[studentTeam(s.id)]}</td>

          <td>${oral}</td>
          <td>${quiz}</td>

          <td>
            <b>${personalPoints(s.id)}</b>
          </td>
        </tr>
      `;
    }).join("");
}

// ===============================================
// 19. КОНСПЕКТІ КӨШІРУ
// ===============================================

$("copyNotes").addEventListener(
  "click",
  async () => {
    const content = $("notesContent").innerText;

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea =
          document.createElement("textarea");

        textarea.value = content;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const success =
          document.execCommand("copy");

        textarea.remove();

        if (!success) {
          throw new Error("Көшіру сәтсіз");
        }
      }

      alert("✅ Конспект көшірілді!");
    } catch (error) {
      alert(
        "Конспектіні белгілеп, " +
        "Ctrl + C арқылы көшір."
      );
    }
  }
);

// ===============================================
// 20. ЖАҢА САБАҚ
// ===============================================

$("resetLesson").addEventListener(
  "click",
  () => {
    const accepted = confirm(
      "Жаңа сабақ бастаймыз ба?\n\n" +
      "Барлық бағалар, ұпайлар " +
      "және қатысу белгілері тазаланады."
    );

    if (!accepted) return;

    state = initialState();
    activeGame = 0;

    save();
    stopVideo();
    changeGame(0);
    goTo(0);
  }
);

// ===============================================
// 21. БАРЛЫҚ БЕТТІ ЖАҢАРТУ
// ===============================================

function refresh() {
  renderAttendance();
  renderTeamRoster();

  renderOral();
  renderQuiz();

  renderBattle();
  renderLogic();
  renderCreative();

  renderScores();
  updateClock();
}

// ===============================================
// 22. САЙТТЫ ІСКЕ ҚОСУ
// ===============================================

function initialize() {
  const page = Math.max(
    0,
    Math.min(
      PAGE_COUNT - 1,
      Number(state.page) || 0
    )
  );

  changeGame(0);
  goTo(page);
}

initialize();

// ===============================================
// MADE BY DARKHAN
// ===============================================
