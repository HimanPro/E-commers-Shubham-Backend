const cron = require('node-cron');
const { distributeDailyCashback } = require('../services/cashbackService');

function startCashbackScheduler() {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cashback distribution...');
    try {
      await distributeDailyCashback();
      console.log('Daily cashback distribution completed');
    } catch (error) {
      console.error('Error in cashback distribution:', error);
    }
  });
}

module.exports = startCashbackScheduler;