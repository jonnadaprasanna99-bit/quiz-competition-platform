const welcome = document.getElementById("welcome");
const quiz = document.getElementById("quiz");
const result = document.getElementById("result");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const errorText = document.getElementById("error");

let questions = [];
let currentQuestion = 0;
let answers = [];

let selectedAnswer = null;
let timeLeft = 15;
let timer = null;


// -------------------------
// SCREEN
// -------------------------

function showScreen(screen) {
  welcome.classList.add("hidden");
  quiz.classList.add("hidden");
  result.classList.add("hidden");

  screen.classList.remove("hidden");
}


// -------------------------
// START QUIZ
// -------------------------

async function startQuiz() {

  startBtn.disabled = true;
  startBtn.textContent = "Loading...";

  errorText.textContent = "";

  try {

    const response = await fetch("/api/questions");

    if (!response.ok) {
      throw new Error("Questions not loaded");
    }

    questions = await response.json();

    if (!questions.length) {
      throw new Error("No questions");
    }

    currentQuestion = 0;
    answers = [];

    showScreen(quiz);

    showQuestion();

  } catch (error) {

    console.error(error);

    errorText.textContent =
      "Questions load avvaledu. Server check cheyyandi.";

  }

  startBtn.disabled = false;
  startBtn.textContent = "Start Quiz →";
}


// -------------------------
// SHOW QUESTION
// -------------------------

function showQuestion() {

  clearInterval(timer);

  const question = questions[currentQuestion];

  selectedAnswer = null;
  timeLeft = 15;

  document.getElementById("questionCount").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  document.getElementById("questionText").textContent =
    question.question;

  document.getElementById("answeredCount").textContent =
    "Choose an answer";

  document.getElementById("timer").textContent =
    "15s";

  nextBtn.disabled = true;

  nextBtn.textContent =
    currentQuestion === questions.length - 1
      ? "Submit Quiz ✓"
      : "Next →";

  document.getElementById("progress").style.width =
    `${(currentQuestion / questions.length) * 100}%`;


  const optionsContainer =
    document.getElementById("options");

  optionsContainer.innerHTML = "";


  question.options.forEach((option, index) => {

    const button = document.createElement("button");

    button.className = "option";

    button.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;


    button.addEventListener("click", () => {

      selectedAnswer = index;

      document
        .querySelectorAll(".option")
        .forEach((item) => {
          item.classList.remove("selected");
        });

      button.classList.add("selected");

      document.getElementById("answeredCount").textContent =
        "Answer selected";

      nextBtn.disabled = false;
    });


    optionsContainer.appendChild(button);

  });


  timer = setInterval(() => {

    timeLeft--;

    document.getElementById("timer").textContent =
      `${timeLeft}s`;

    if (timeLeft <= 0) {

      clearInterval(timer);

      saveAnswer();
    }

  }, 1000);
}


// -------------------------
// SAVE ANSWER
// -------------------------

function saveAnswer() {

  clearInterval(timer);

  const question = questions[currentQuestion];

  answers.push({
    id: question.id,
    selected:
      selectedAnswer === null
        ? -1
        : selectedAnswer
  });


  currentQuestion++;


  if (currentQuestion < questions.length) {

    showQuestion();

  } else {

    submitQuiz();

  }
}


// -------------------------
// SUBMIT QUIZ
// -------------------------

async function submitQuiz() {

  showScreen(result);

  document.getElementById("score").textContent =
    "Loading...";

  document.getElementById("resultMessage").textContent =
    "Calculating result...";

  document.getElementById("review").innerHTML = "";


  try {

    const response = await fetch("/api/submit", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        answers: answers
      })

    });


    if (!response.ok) {
      throw new Error("Result error");
    }


    const data = await response.json();


    document.getElementById("score").textContent =
      `${data.score}/${data.total}`;


    document.getElementById("percentage").textContent =
      `${data.percentage}% score`;


    if (data.percentage >= 80) {

      document.getElementById("resultMessage").textContent =
        "Excellent work! 🎉";

    } else if (data.percentage >= 50) {

      document.getElementById("resultMessage").textContent =
        "Good effort! 👍";

    } else {

      document.getElementById("resultMessage").textContent =
        "Keep practising! 💪";

    }


    const review =
      document.getElementById("review");


    data.results.forEach((item) => {

      const box = document.createElement("div");

      box.className = "review-item";


      const question =
        document.createElement("strong");

      question.textContent =
        item.question;


      const yourAnswer =
        document.createElement("p");

      yourAnswer.textContent =
        "Your answer: " +
        (
          item.selected >= 0
            ? item.options[item.selected]
            : "Not answered"
        );


      const correctAnswer =
        document.createElement("p");

      correctAnswer.textContent =
        "Correct answer: " +
        item.options[item.correctAnswer];


      if (item.correct) {

        yourAnswer.className =
          "correct-text";

      } else {

        yourAnswer.className =
          "wrong-text";

      }


      correctAnswer.className =
        "correct-text";


      box.appendChild(question);
      box.appendChild(yourAnswer);
      box.appendChild(correctAnswer);

      review.appendChild(box);

    });


  } catch (error) {

    console.error(error);

    document.getElementById("score").textContent =
      "--";

    document.getElementById("resultMessage").textContent =
      "Result load avvaledu.";

  }
}


// -------------------------
// BUTTONS
// -------------------------

startBtn.addEventListener(
  "click",
  startQuiz
);


nextBtn.addEventListener(
  "click",
  () => {

    if (!nextBtn.disabled) {
      saveAnswer();
    }

  }
);


restartBtn.addEventListener(
  "click",
  () => {

    clearInterval(timer);

    currentQuestion = 0;
    answers = [];

    showScreen(welcome);

  }
);