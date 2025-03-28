import TwemojiSun from "~icons/twemoji/sun";
import TwemojiCloud from "~icons/twemoji/cloud";
import TwemojiSunBehindCloud from "~icons/twemoji/sun-behind-cloud";
import TwemojiCloudWithRain from "~icons/twemoji/cloud-with-rain";
import TwemojiCloudWithSnow from "~icons/twemoji/cloud-with-snow";
import TwemojiSunBehindRainCloud from "~icons/twemoji/sun-behind-rain-cloud";
import TwemojiSunBehindSmallCloud from "~icons/twemoji/sun-behind-small-cloud";
import TwemojiCloudWithLightning from "~icons/twemoji/cloud-with-lightning";
import TwemojiCloudWithLightningAndRain from "~icons/twemoji/cloud-with-lightning-and-rain";
import TwemojiFog from "~icons/twemoji/fog";

export const conditionToIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Clear: TwemojiSun,
  Sunny: TwemojiSun,
  "Partly cloudy": TwemojiSunBehindSmallCloud,
  Cloudy: TwemojiCloud,
  Overcast: TwemojiCloud,
  Mist: TwemojiFog,
  Fog: TwemojiFog,

  // Light & patchy rain
  "Patchy rain possible": TwemojiSunBehindRainCloud,
  "Light rain": TwemojiSunBehindRainCloud,
  "Moderate rain": TwemojiCloudWithRain,
  "Heavy rain": TwemojiCloudWithRain,
  Rain: TwemojiCloudWithRain,

  // Snow
  "Light snow": TwemojiCloudWithSnow,
  "Moderate snow": TwemojiCloudWithSnow,
  "Heavy snow": TwemojiCloudWithSnow,
  Snow: TwemojiCloudWithSnow,

  // Thunder
  "Patchy thunderstorm": TwemojiCloudWithLightning,
  "Thundery outbreaks possible": TwemojiCloudWithLightning,
  Thunder: TwemojiCloudWithLightning,
  Thunderstorm: TwemojiCloudWithLightningAndRain,

  // Catch-alls
  default: TwemojiSunBehindCloud,
};
