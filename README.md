# Evie's Weather Forecasting App

A browser-based weather consensus app that compares six independent forecast-model feeds through Open-Meteo:

- UK Met Office — UKMO Seamless
- ECMWF — IFS
- DWD — ICON Seamless
- NOAA/NCEP — GFS Seamless
- Météo-France — ARPEGE Europe
- KNMI — HARMONIE-AROME Europe

## Hourly consensus

The Next 24 Hours and Tomorrow Hour-by-Hour sections calculate each hour directly from the model feeds that have data for that timestamp.

- Temperature = average of available model temperatures.
- “% models rain” = the share of available models forecasting at least 0.1 mm precipitation in that hour.
- Vote = shown as e.g. `4/6 rain` when all six contribute.
- If a source is unavailable for an hour, the card explicitly says `4/5 available rain` rather than implying all six were available.

## Rain likelihood traffic lights

Hourly and daily traffic lights represent rain likelihood only:

- 0–2 of 6 models predicting rain = Low (red)
- 3–4 of 6 models predicting rain = Medium (yellow)
- 5–6 of 6 models predicting rain = High (green)

When fewer than six models are available, the same thresholds are applied proportionally to the available models.

Open `index.html` in a modern browser. Internet access is required to fetch live forecasts.
