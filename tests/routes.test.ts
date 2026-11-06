import assert from "node:assert/strict";
import test from "node:test";
import { renderLearn } from "../src/app/app.ts";
import {
  getPracticeHref,
  practiceRoutes,
  resolvePracticeScenario,
  resolveRoute,
  routes,
} from "../src/app/routes.ts";

test("seluruh route utama dapat di-resolve", () => {
  for (const route of routes) {
    assert.equal(resolveRoute(route.href), route.id);
  }

  assert.equal(resolveRoute(""), "home");
  assert.equal(resolveRoute("#/alamat-tidak-ada"), "not-found");
});

test("route latihan membuka skenario yang sesuai", () => {
  for (const route of practiceRoutes) {
    assert.equal(resolveRoute(route.href), "simulation");
    assert.equal(resolvePracticeScenario(route.href), route.scenarioId);
    assert.equal(getPracticeHref(route.scenarioId), route.href);
  }

  assert.equal(resolvePracticeScenario("#/simulasi"), null);
  assert.equal(resolveRoute("#/simulasi/tidak-ada"), "not-found");
});

test("tautan Belajar mengarah ke latihan skenario terkait", () => {
  const html = renderLearn();

  assert.match(html, /href="#\/simulasi\/kurir-apk"/);
  assert.match(html, /href="#\/simulasi\/nama-penerima"/);
  assert.match(html, /href="#\/simulasi\/otp"/);
  assert.match(html, /href="#\/simulasi">Mulai simulasi lengkap/);
  assert.equal(html.match(/<article class="learn-story/g)?.length, 3);
  assert.equal(html.match(/class="learn-speech"/g)?.length, 3);
  assert.equal(html.match(/<details class="learn-story__details">/g)?.length, 3);
  assert.match(html, /src="\/img\/learn-apk-guide.webp"/);
  assert.match(html, /src="\/img\/learn-otp-guide.webp"/);
  assert.match(html, /src="\/img\/learn-qris-guide.webp"/);
});
