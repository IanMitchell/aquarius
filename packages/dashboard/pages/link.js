import { useEffect } from 'react';
import useSWR from 'swr';

export default function Link() {
  const { data } = useSWR('https://api.aquarius.sh/link');

  useEffect(() => {
    if (data?.url) {
      window.location = data.url;
    }
  }, [data]);

  return null;
}
