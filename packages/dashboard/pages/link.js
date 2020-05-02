/* global window */
import { useEffect } from 'react';

export default function Link() {
  // const { data } = useSWR('https://api.aquarius.sh/link');

  // useEffect(() => {
  //   if (data?.url) {
  //     window.location = data.url;
  //   }
  // }, [data]);

  useEffect(() => {
    window.location =
      'https://discordapp.com/oauth2/authorize/?client_id=176793254350684160&scope=bot&permissions=1543892032';
  }, []);

  return null;
}
