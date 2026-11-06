import assert from "node:assert/strict";
import test from "node:test";
import { renderSos } from "../src/app/app.ts";
import {
  shouldShowSosIncident,
  sosIncidentIds,
  toggleSosIncident,
} from "../src/features/sos/model.ts";

test("SOS menampilkan seluruh panduan saat belum ada filter", () => {
  const html = renderSos();

  assert.equal(html.match(/data-sos-incident=/g)?.length, 4);
  assert.doesNotMatch(html, /data-sos-incident="[^"]+"\s+hidden/);
  assert.match(html, /Semua panduan sedang ditampilkan/);
  assert.match(html, /Pilihan tidak disimpan/);
});

test("filter SOS dapat memilih lebih dari satu kejadian", () => {
  let selected = toggleSosIncident([], "apk");
  selected = toggleSosIncident(selected, "secret");

  assert.deepEqual(selected, ["secret", "apk"]);
  assert.equal(shouldShowSosIncident(selected, "secret"), true);
  assert.equal(shouldShowSosIncident(selected, "apk"), true);
  assert.equal(shouldShowSosIncident(selected, "transfer"), false);

  selected = toggleSosIncident(selected, "secret");
  assert.deepEqual(selected, ["apk"]);
});

test("hasil render SOS menyembunyikan kejadian yang tidak dipilih", () => {
  const html = renderSos(["transfer", "payment"]);

  assert.match(html, /data-sos-incident="transfer"\s*>/);
  assert.match(html, /data-sos-incident="payment"\s*>/);
  assert.match(html, /data-sos-incident="secret"\s+hidden/);
  assert.match(html, /data-sos-incident="apk"\s+hidden/);
  assert.match(html, /2 panduan dipilih/);
});

test("SOS hanya menautkan kanal resmi yang telah ditentukan", () => {
  const html = renderSos();

  assert.match(html, /href="https:\/\/iasc\.ojk\.go\.id"/);
  assert.match(html, /href="tel:131"/);
  assert.match(html, /href="https:\/\/bicara131\.bi\.go\.id"/);
  assert.equal(sosIncidentIds.length, 4);
});
