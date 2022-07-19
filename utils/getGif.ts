import axios from 'axios';

const getGif = async ({
  id,
  tag,
  rating
}: {
  id?: string;
  tag?: string;
  rating?: string;
}) => {
  const url = `https://api.giphy.com/v1/gifs/${id ?? 'random'}`;

  const gif = await axios.get<{ data: { id: string } }>(url, {
    params: {
      api_key: process.env.GIPHY_KEY,
      tag,
      rating
    }
  });

  return `https://media0.giphy.com/media/${gif.data.data.id}/giphy.gif`;
};

export default getGif;
