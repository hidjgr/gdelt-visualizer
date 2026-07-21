const LASTUPDATE_URL = 'http://data.gdeltproject.org/gdeltv2/lastupdate.txt';

const COLS = {
  Actor1Name: 6,
  Actor1CountryCode: 7,
  Actor2Name: 16,
  Actor2CountryCode: 17,
  EventRootCode: 28,
  EventCode: 26,
  GoldsteinScale: 30,
  NumMentions: 31,
  NumSources: 32,
  AvgTone: 34,
  Actor1Geo_Type: 35,
  Actor1Geo_Lat: 39,
  Actor1Geo_Long: 40,
  Actor2Geo_Type: 43,
  Actor2Geo_Lat: 47,
  Actor2Geo_Long: 48,
  ActionGeo_Type: 51,
  ActionGeo_Lat: 55,
  ActionGeo_Long: 56,
  DATEADDED: 59
};

async function getLastNExportUrls(n = 4) {
  const res = await fetch(LASTUPDATE_URL);
  const text = await res.text();
  const firstLine = text.trim().split('\n')[0];
  const latestUrl = firstLine.split(' ').pop();
  const match = latestUrl.match(/(\d{14})\.export\.CSV\.zip$/);
  if (!match) throw new Error('Could not parse latest GDELT timestamp');

  const base = new Date(
    Date.UTC(
      match[1].slice(0, 4),
      Number(match[1].slice(4, 6)) - 1,
      match[1].slice(6, 8),
      match[1].slice(8, 10),
      match[1].slice(10, 12),
      match[1].slice(12, 14)
    )
  );

  const urls = [];
  for (let i = 0; i < n; i++) {
    const t = new Date(base.getTime() - i * 15 * 60 * 1000);
    const stamp =
      t.getUTCFullYear().toString() +
      String(t.getUTCMonth() + 1).padStart(2, '0') +
      String(t.getUTCDate()).padStart(2, '0') +
      String(t.getUTCHours()).padStart(2, '0') +
      String(t.getUTCMinutes()).padStart(2, '0') +
      '00';
    urls.push(`http://data.gdeltproject.org/gdeltv2/${stamp}.export.CSV.zip`);
  }
  return urls;
}

function parseRow(cols) {
  const num = i => (cols[i] ? parseFloat(cols[i]) : null);
  return {
    actor1Name: cols[COLS.Actor1Name] || null,
    actor1CountryCode: cols[COLS.Actor1CountryCode] || null,
    actor1Lat: num(COLS.Actor1Geo_Lat),
    actor1Lon: num(COLS.Actor1Geo_Long),
    actor2Name: cols[COLS.Actor2Name] || null,
    actor2CountryCode: cols[COLS.Actor2CountryCode] || null,
    actor2Lat: num(COLS.Actor2Geo_Lat),
    actor2Lon: num(COLS.Actor2Geo_Long),
    actionLat: num(COLS.ActionGeo_Lat),
    actionLon: num(COLS.ActionGeo_Long),
    actionGeoType: num(COLS.ActionGeo_Type),
    eventRootCode: cols[COLS.EventRootCode],
    eventCode: cols[COLS.EventCode],
    goldsteinScale: num(COLS.GoldsteinScale),
    avgTone: num(COLS.AvgTone),
    numMentions: num(COLS.NumMentions),
    numSources: num(COLS.NumSources),
    dateAdded: cols[COLS.DATEADDED]
  };
}

async function main() {
  const urls = await getLastNExportUrls(4);
  console.log('Fetching:', urls);

  console.log(
    'Scaffold only: install adm-zip and uncomment the extraction block above ' +
      'to produce real output.'
  );
}

main().catch(console.error);
