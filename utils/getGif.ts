import axios from "axios";
import { logtail } from "./logtailConfig";

const getGif = async ({
  id,
  tag,
  rating,
}: {
  id?: string;
  tag?: string;
  rating?: string;
}) => {
  const url = `https://api.giphy.com/v1/gifs/${id ?? "random"}`;

  try {
    const gif = await axios.get<{ data: { id: string } }>(url, {
      params: {
        api_key: process.env.GIPHY_KEY,
        tag,
        rating,
      },
    });

    return `https://media0.giphy.com/media/${gif.data.data.id}/giphy.gif`;
  } catch (err) {
    await logtail.error(
      "Error fetching GIF.",
      JSON.parse(
        JSON.stringify({
          err,
          id,
          tag,
          rating,
        }),
      ),
    );
  }
};

export default getGif;
