const INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com"; // endpoint do InfluxDB (Cloud ou seu servidor)
const ORG = "Infra-watch";
const BUCKET = "infra-watch";
const TOKEN = "oGlZ3AapuGDyZW0FukmlXCetJZ7E6ongRVzwctXfr9mEJH3suPAHxMpKreDJZH5a6r0Wy1rrMqgbj9SkjLcxLw=="; // seu token gerado

function escapeInfluxValue(value) {
  return value
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"')   // Escape double quotes
    .replace(/,/g, '\\,')   // Escape commas
    .replace(/=/g, '\\=')   // Escape equals
    .replace(/ /g, '\\ ');  // Escape spaces
}

// Utility function to convert object to InfluxDB fields
function objectToFields(obj) {
  let fields = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue; // Skip null/undefined
    let formattedValue;
    if (typeof value === 'string') {
      formattedValue = `"${escapeInfluxValue(value)}"`;
    } else if (typeof value === 'number') {
      formattedValue = value.toString();
    } else if (typeof value === 'boolean') {
      formattedValue = value.toString();
    } else {
      // Convert other types to string and escape
      formattedValue = `"${escapeInfluxValue(JSON.stringify(value))}"`;
    }
    fields.push(`${escapeInfluxValue(key)}=${formattedValue}`);
  }
  return fields.join(',');
}

async function writeLog(serverId, payload) {
  // Validate inputs
  if (!serverId || typeof serverId !== 'string') {
    throw new Error('Invalid serverId: must be a non-empty string');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: must be a non-null object');
  }

  const timestamp = Date.now() * 1_000_000; // Nanoseconds
  const fields = objectToFields(payload); // Convert payload to fields

  // Construct line protocol
  const lineProtocol = `metrics,serverId=${escapeInfluxValue(serverId)} ${fields} ${timestamp}`;

  const url = `${INFLUX_URL}/api/v2/write?org=${ORG}&bucket=${BUCKET}&precision=ns`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: lineProtocol,
    });

    if (!res.ok) {
      throw new Error(`Failed to write to InfluxDB: ${res.status} ${await res.text()}`);
    }

    console.log('Log written to InfluxDB');
  } catch (error) {
    throw new Error(`Error writing to InfluxDB: ${error.message}`);
  }
}

const payload = {
  temperature: 22.5,
  status: 'active',
  errorCount: 0,
  details: { foo: 'bar' },
};

console.log(typeof payload, payload);

//await writeLog('server-123', payload);