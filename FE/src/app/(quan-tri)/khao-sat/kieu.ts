export interface DapAn {
  giaTri: string;
  nhan: string;
  moTa: string;
}

export interface CauHoi {
  _id: string;
  khoa: string;
  thuTu: number;
  cauHoi: string;
  moTa: string;
  nhieuLuaChon: boolean;
  batBuoc: boolean;
  dapAn: DapAn[];
  dangHienThi: boolean;
}
