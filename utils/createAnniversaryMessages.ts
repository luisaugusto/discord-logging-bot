import { Client, Collection, Guild, GuildMember } from 'discord.js';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import differenceInYears from 'date-fns/differenceInYears';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import getMonth from 'date-fns/getMonth';
import getDate from 'date-fns/getDate';
import { getLoggingChannel } from './getLoggingChannel';
import { userMention } from '@discordjs/builders';
import getGif from './getGif';

const getUsersWithAnniversaries = async (guild: Guild) => {
  const allMembers = await guild.members.fetch();

  const currentMonth = getMonth(new Date());
  const currentDate = getDate(new Date());

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
  guild: Guild
) => {
  const anniversaryChannel = await getLoggingChannel(
    guild.channels,
    process.env.ANNIVERSARY_CHANNEL
  );

  return Promise.all(
    users.map(async ({ joinedAt, id, displayName }) => {
      console.log(
        `Sending message for ${displayName} (${id}) on ${joinedAt?.toISOString()}`
      );

      const gif = await getGif({ tag: 'dance', rating: 'pg-13' });

      return (
        joinedAt &&
        anniversaryChannel.send({
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
};

const createAnniversaryMessages = (client: Client<true>) => {
  const timeUntilNextDay = differenceInMilliseconds(
    startOfTomorrow(),
    new Date()
  );
  console.log({ timeUntilNextDay });

  setTimeout(async () => {
    const guilds = await client.guilds.fetch();

    await Promise.all(
      guilds.map(async oathGuild => {
        const guild = await oathGuild.fetch();
        console.log(`Fetching users for ${guild.name} (${guild.id})...`);

        const users = await getUsersWithAnniversaries(guild);

        console.log(`${users.size} users found with anniversary.`);

        if (users.size === 0) return;
        await sendMessageForUsers(users, guild);
        console.log(`messages sent!`);
      })
    );

    createAnniversaryMessages(client);
  }, timeUntilNextDay);
};

export default createAnniversaryMessages;
