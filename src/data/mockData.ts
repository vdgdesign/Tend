export type Specialist = {
  id: string;
  role: string;
  description: string;
  oneLine: string;
  questions: string[];
  bring: string[];
};

export type Diagnosis = {
  name: string;
  summary: string;
  selfCare?: string;
  specialists: Specialist[];
  conversation: {
    theyAsk: string[];
    youAsk: string[];
  };
  horizon: { label: string; body: string }[];
};
