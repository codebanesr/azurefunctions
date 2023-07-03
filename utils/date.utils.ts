export const toRFC3339Timestamp = date => date.toISOString().slice(0, -3) + "Z";
