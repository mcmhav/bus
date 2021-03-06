import { getTable } from 'console.table';
import { differenceInMinutes } from 'date-fns';
import fetch from 'node-fetch';
import { query } from './query.js';

import argv from 'minimist';

console.log(argv);

// const argv = require('minimist')(process.argv.slice(2));

const COUNT = argv.c || 10;
const STOP_ID = argv.s || '6449';

const BASE_URL = 'https://api.entur.io/journey-planner/v2/graphql';

const ids = [`NSR:Quay:${STOP_ID}`];

const body = {
  query: query,
  variables: {
    ids: ids,
    start: new Date(),
    omitNonBoarding: true,
    timeRange: 72000,
    limit: COUNT,
  },
};

const ignore_list = ['270', '225'];

fetch(BASE_URL, {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})
  .then(res => {
    return res.status === 200 && res.json();
  })
  .then(json => {
    json.data.quays.forEach(platform => {
      const deps = [];
      platform.estimatedCalls.forEach(estimatedCall => {
        const {
          aimedDepartureTime,
          expectedDepartureTime,
          serviceJourney,
        } = estimatedCall;
        console.log(estimatedCall);

        const tillDeparture = differenceInMinutes(expectedDepartureTime, Date.now());

        const dep = {
          id: serviceJourney.line.publicCode,
          tillDeparture: tillDeparture,
          tillAimedDeparture: differenceInMinutes(aimedDepartureTime, Date.now()),
          expectedDepartureTime: expectedDepartureTime,
          aimedDepartureTime: aimedDepartureTime,
        };

        if (!ignore_list.includes(serviceJourney.line.publicCode)) {
          deps.push(dep);
        }
      });

      const table = getTable(deps.slice(0, COUNT));
      console.log(table);
    });
  })
  .catch(err => {
    console.log(err);
  });
