# Evie's Weather Forecasting App

A browser-based weather consensus app that compares six independent forecast-model feeds through Open-Meteo:

- UK Met Office — UKMO Seamless
- ECMWF — IFS
- DWD — ICON Seamless
- NOAA/NCEP — GFS Seamless
- Météo-France — ARPEGE Europe
- KNMI — HARMONIE-AROME Europe

## Hourly consensus

The Next 24 Hours and Tomorrow Hour-by-Hour sections now calculate each hour directly from the model feeds that have data for that timestamp.

- Temperature = average of available model temperatures.
- “% models wet” = the share of available models forecasting at least 0.1 mm precipitation in that hour.
- Vote = shown as e.g. `4/6 wet` when all six contribute.
- If a source is unavailable for an hour, the card explicitly says `4/5 available wet` rather than misleadingly displaying `4/4` as though only four sources existed.
- Green / yellow / red reflects model agreement and temperature spread.

Open `index.html` in a modern browser. Internet access is required to fetch live forecasts.
