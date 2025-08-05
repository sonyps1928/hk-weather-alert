//import fetch from 'node-fetch';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const severityMap = {
  WRAINY: '🟡 Amber Rainstorm',
  WRAINR: '🔴 Red Rainstorm',
  WRAINB: '⚫ Black Rainstorm',
  WTS: '⛈️ Thunderstorm',
  WL: '🌧️ Landslip',
  WFNTSA: '🌊 Flooding',
  TC1: '🌀 Typhoon Signal No. 1',
  TC3: '🌀 Typhoon Signal No. 3',
  TC8: '🌀 Typhoon Signal No. 8',
  TC9: '🌀 Typhoon Signal No. 9',
  TC10: '🌀 Typhoon Signal No. 10'
};

function getSeverity(code) {
  return severityMap[code] || '⚠️ General Warning';
}

export async function handler(event, context) {
  try {
    const response = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en');
    const data = await response.json();

    const warnings = Object.entries(data).map(([key, item]) => ({
      code: item.code,
      name: item.name,
      actionCode: item.actionCode,
      updateTime: item.updateTime,
      severity: getSeverity(item.code)
    })).filter(w => w.actionCode !== 'CANCEL');

    if (warnings.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No active warnings.' })
      };
    }

    const alertMessage = warnings.map(w =>
      `${w.severity}\n*${w.name}*\nStatus: ${w.actionCode}\nUpdated: ${w.updateTime}`
    ).join('\n\n');

    if (!SLACK_WEBHOOK_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing Slack webhook URL.' })
      };
    }

    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🚨 *HK Weather Warning Alert* 🚨\n\n${alertMessage}` })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Alerts sent to Slack!' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}


