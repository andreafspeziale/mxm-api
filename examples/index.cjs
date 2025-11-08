const { MxmAPI } = require('@andreafspeziale/mxm-api');

const MXM_API_KEY = process.env.MXM_API_KEY;

const client = new MxmAPI({
  config: {
    enableLog: true,
    apiKey: MXM_API_KEY,
    defaultLoggerConfig: { level: 'debug' },
  },
});

(async () => {
  await client
    .trackLyricsFingerprintPost({
      text: "Fratelli d'Italia l'Italia s'è desta, dell'elmo di Scipio s'è cinta la testa. Dov'è la Vittoria? Le porga la chioma, ché schiava di Roma Iddio la creò.",
    })
    .catch((_) => {
      process.exit(1);
    });

  process.exit(0);
})();
