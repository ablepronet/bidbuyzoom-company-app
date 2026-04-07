type SaleTypeTimeCheck = 'start_end' | 'single' | 'multiple';

type MultiStartDate = {
  _id?: string;
  startDate: string;
  startTime: string;
  endTime?: string;
};

export type Sale = {
  slaeTypeTimeCheck: SaleTypeTimeCheck;
  multiStartDate?: MultiStartDate[];
};

export type SaleDatesResult = {
  start: string | null;
  end: string | null;
};
