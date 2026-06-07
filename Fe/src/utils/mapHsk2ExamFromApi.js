// src/utils/mapHsk2ExamFromApi.js

export function mapHsk2ExamFromApi(exam) {
  if (!exam || !Array.isArray(exam.sections)) {
    return {
      listening: { part1: [], part2: [], part3: [], part4: [] },
      reading: { part1: [], part2: [], part3: [], part4: [] },
      readingBanks: {
        reading1Images: [],
        reading2WordBank: [],
        reading4BankFirst: [],
        reading4BankSecond: [],
      },
    };
  }

  const listeningSection = exam.sections.find((s) => s.skill === "listening");
  const readingSection = exam.sections.find((s) => s.skill === "reading");

  const L = (listeningSection && listeningSection.questions) || [];
  const R = (readingSection && readingSection.questions) || [];

  return {
    listening: {
      // 1–10
      part1: L.slice(0, 10),
      // 11–20
      part2: L.slice(10, 20),
      // 21–30
      part3: L.slice(20, 30),
      // 31–35
      part4: L.slice(30, 35),
    },
    reading: {
      // 36–40
      part1: R.slice(0, 5),
      // 41–45
      part2: R.slice(5, 10),
      // 46–50
      part3: R.slice(10, 15),
      // 51–60
      part4: R.slice(15, 25),
    },
    readingBanks: {
      reading1Images: exam.reading1Images || [],
      reading2WordBank: exam.reading2WordBank || [],
      reading4BankFirst: exam.reading4BankFirst || [],
      reading4BankSecond: exam.reading4BankSecond || [],
    },
  };
}
