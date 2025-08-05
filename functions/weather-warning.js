export default async (req, res) => {
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
      return res.status(200).json({ message: 'No active warnings.' });
    }

    const alertMessage = warnings.map(w => `${w.severity}\n*${w.name}*\nStatus: ${w.actionCode}\nUpdated: ${w.updateTime}`).join('\n\n');

    // ✅ Guard clause for missing webhook
    if (!SLACK_WEBHOOK_URL) {
      return res.status(500).json({ error: 'Missing Slack webhook URL.' });
    }

    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `🚨 *HK Weather Warning Alert* 🚨\n\n${alertMessage}` })
    });

    return res.status(200).json({ message: 'Alerts sent to Slack!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

