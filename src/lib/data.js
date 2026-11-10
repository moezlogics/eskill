import { cache } from "react";
import { connectDB } from "./db";
import { Setting } from "@/models";
import { DEFAULT_SETTINGS } from "./defaults";
import { plain } from "./utils";

export const getSettings = cache(async () => {
  await connectDB();
  const s = await Setting.findOne({ key: "site" }).lean();
  return { ...DEFAULT_SETTINGS, ...plain(s || {}) };
});
