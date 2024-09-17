// Merge consecutive UP/DOWN periods into ranges
const mergeStatusPeriods = (statuses) => {
    const merged = [];
    let start = null;
    let currentStatus = null;
  
    statuses.forEach(({ timestamp, status }) => {
      if (!start) {
        start = timestamp;
        currentStatus = status;
      } else if (status !== currentStatus) {
        merged.push({ start, end: timestamp, status: currentStatus });
        start = timestamp;
        currentStatus = status;
      }
    });
  
    if (start) {
      merged.push({ start, end: new Date().toISOString(), status: currentStatus });
    }
  
    return merged;
  };
  
  module.exports = mergeStatusPeriods;
  