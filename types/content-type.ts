type TContenta = {
  role: string;
  parts: { text: string }[];
}[];

type TSocketReq = {
  conversations: [string, { messages?: string }, { model?: string }];
};

export type { TContenta, TSocketReq };
