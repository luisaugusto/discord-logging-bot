import {
  Client,
  Collection,
  Guild,
  GuildMember,
  TextChannel
} from 'discord.js';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import differenceInYears from 'date-fns/differenceInYears';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import getMonth from 'date-fns/getMonth';
import getDate from 'date-fns/getDate';
import { getLoggingChannel } from './getLoggingChannel';
import { userMention } from '@discordjs/builders';
import getGif from './getGif';

const getUsersWithAnniversaries = async ({
  guild,
  currentMonth,
  currentDate
}: {
  guild: Guild;
  currentMonth: number;
  currentDate: number;
}) => {
  const allMembers = await guild.members.fetch();

  return allMembers.filter(user => {
    if (!user.joinedAt) return false;
    console.log({
      user: user.displayName,
      id: user.id,
      joinedAt: user.joinedAt.toISOString()
    });
    const joinMonth = getMonth(user.joinedAt);
    const joinDate = getDate(user.joinedAt);

    return (
      !user.user.bot && joinMonth === currentMonth && joinDate === currentDate
    );
  });
};

const sendMessageForUsers = async (
  users: Collection<string, GuildMember>,
  channel: TextChannel
) =>
  Promise.all(
    users.map(async ({ joinedAt, id, displayName }) => {
      console.log(
        `Sending message for ${displayName} (${id}) on ${joinedAt?.toISOString()}`
      );
      const gif = await getGif({ tag: 'dance', rating: 'pg-13' });
      return (
        joinedAt &&
        channel.send({
          content: `Happy discord anniversary to ${userMention(
            id
          )}, who has been in the server for a total of ${differenceInYears(
            new Date(),
            joinedAt
          )} years! 🎉🎊🥳`,
          embeds: [
            {
              image: {
                url: gif
              },
              timestamp: joinedAt.toISOString()
            }
          ]
        })
      );
    })
  );

const createAnniversaryMessages = (client: Client<true>) => {
  const timeUntilNextDay = differenceInMilliseconds(
    startOfTomorrow(),
    new Date()
  );
  console.log({ timeUntilNextDay });

  setTimeout(async () => {
    const currentMonth = getMonth(new Date());
    const currentDate = getDate(new Date());

    const guilds = await client.guilds.fetch();

    await Promise.all(
      guilds.map(async oathGuild => {
        const guild = await oathGuild.fetch();
        console.log(`Fetching users for ${guild.name} (${guild.id})...`);

        const anniversaryChannel = await getLoggingChannel(
          guild.channels,
          process.env.ANNIVERSARY_CHANNEL
        );

        const users = await getUsersWithAnniversaries({
          guild,
          currentMonth,
          currentDate
        });

        console.log(`${users.size} users found with anniversary.`);

        await sendMessageForUsers(users, anniversaryChannel);
        console.log(`messages sent!`);
      })
    );

    createAnniversaryMessages(client);
  }, timeUntilNextDay);
};

export default createAnniversaryMessages;
