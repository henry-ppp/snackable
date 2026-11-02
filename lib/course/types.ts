/**
 * The content contract. A subject file in content/subjects is the only
 * thing a new study adds. See MANUAL.md.
 */

export type Choice = {
  id: string;
  text: string;
};

/** A crop that belongs to the round. `src` is a public path or a URL. */
export type RoundImage = {
  src: string;
  alt: string;
};

export type ConceptRound = {
  kind: "concept";
  id: string;
  title: string;
  body: string;
  image?: RoundImage;
};

export type QuestionRound = {
  kind: "question";
  id: string;
  prompt: string;
  choices: Choice[];
  answerId: string;
  /** Shown after the player answers, whether they were right or wrong. */
  explain: string;
  image?: RoundImage;
};

export type Round = ConceptRound | QuestionRound;

export type Level = {
  id: string;
  title: string;
  /** Hearts at the start of an attempt. A wrong answer spends one. */
  hearts: number;
  /** XP for a perfect clear. A clear with hearts missing pays a fraction. */
  xp: number;
  rounds: Round[];
};

export type Topic = {
  id: string;
  title: string;
  summary: string;
  levels: Level[];
};

export type Subject = {
  id: string;
  title: string;
  blurb: string;
  topics: Topic[];
};

export function problemsIn(subject: Subject): string[] {
  const problems: string[] = [];
  const levelIds = new Set<string>();

  if (!subject.id || !subject.title) {
    problems.push("A subject needs an id and a title.");
  }
  if (subject.topics.length === 0) {
    problems.push(`${subject.id || "subject"} has no topics.`);
  }

  for (const topic of subject.topics) {
    if (topic.levels.length === 0) {
      problems.push(`Topic "${topic.title}" has no levels.`);
    }
    for (const level of topic.levels) {
      if (levelIds.has(level.id)) {
        problems.push(`Level id "${level.id}" is used twice.`);
      }
      levelIds.add(level.id);
      if (level.hearts < 1) {
        problems.push(`Level "${level.title}" needs at least one heart.`);
      }
      const questions = level.rounds.filter((round) => round.kind === "question");
      if (questions.length === 0) {
        problems.push(`Level "${level.title}" needs at least one question.`);
      }
      for (const round of level.rounds) {
        if (round.image && (!round.image.src || !round.image.alt)) {
          problems.push(`Round "${round.id}" has an image that needs a src and an alt.`);
        }
      }
      for (const round of questions) {
        if (!round.choices.some((choice) => choice.id === round.answerId)) {
          problems.push(`Question "${round.id}" does not contain its answer.`);
        }
      }
    }
  }

  return problems;
}
