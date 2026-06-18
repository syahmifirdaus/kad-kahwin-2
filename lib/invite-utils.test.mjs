import test from "node:test";
import assert from "node:assert/strict";

import {
  LOCAL_WISHES_KEY,
  WAZE_APP_URL,
  buildWishListAfterSubmit,
  mergeWishLists,
  openWazeWithFallback,
  readStoredWishes,
  writeStoredWishes,
} from "./invite-utils.js";

function createStorage() {
  const state = new Map();
  return {
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, String(value));
    },
  };
}

test("ucapan stays available after a refresh cycle via local storage", () => {
  const storage = createStorage();
  const firstRenderList = buildWishListAfterSubmit([], "Syahmi", "Selamat pengantin baru");

  writeStoredWishes(storage, firstRenderList);

  const afterRefreshList = readStoredWishes(storage);

  assert.equal(afterRefreshList.length, 1);
  assert.deepEqual(afterRefreshList[0], {
    name: "Syahmi",
    text: "Selamat pengantin baru",
  });
});

test("remote wishes and refreshed local wishes are merged without duplicates", () => {
  const remote = [{ name: "Hanis", text: "Barakallah" }];
  const local = [
    { name: "Hanis", text: "Barakallah" },
    { name: "Tetamu", text: "Semoga bahagia" },
  ];

  const merged = mergeWishLists(remote, local);

  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0], { name: "Hanis", text: "Barakallah" });
  assert.deepEqual(merged[1], { name: "Tetamu", text: "Semoga bahagia" });
});

test("waze location icon targets the app deep link first and schedules web fallback", () => {
  const locationObject = { href: "" };
  const scheduled = [];

  openWazeWithFallback(
    locationObject,
    "https://www.waze.com/live-map/directions/savannah-hill-resort-jalan-nasiman-1516-ulu-tiram",
    (callback, delay) => {
      scheduled.push({ callback, delay });
      return 1;
    }
  );

  assert.equal(locationObject.href, WAZE_APP_URL);
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].delay, 600);

  scheduled[0].callback();

  assert.equal(
    locationObject.href,
    "https://www.waze.com/live-map/directions/savannah-hill-resort-jalan-nasiman-1516-ulu-tiram"
  );
});

test("readStoredWishes ignores malformed storage content", () => {
  const storage = createStorage();
  storage.setItem(LOCAL_WISHES_KEY, "{bad json");

  assert.deepEqual(readStoredWishes(storage), []);
});
