import dayjs from "dayjs";

export default function getTimestamp() {
  return dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}
