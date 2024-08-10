// Соединяем бота
require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

// Вешаем команды и их описание

bot.api.setMyCommands([
	{
		command: 'start',
		description: 'Открыть меню',
	}
	// {
	// 	command: 'menu',
	// 	description: 'Главное меню',
	// }
])

const menuKeyboard = new InlineKeyboard().text('Собачки', 'dogs')


bot.command('start', async (ctx) => {
	await ctx.react("❤")
	await ctx.reply(`*Нажмите кнопку*`, {
		parse_mode: 'MarkdownV2',
		reply_markup: menuKeyboard,
	});
});

bot.callbackQuery('dogs', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Еще собачек', 'dogs');
	let response = await fetch('https://dog.ceo/api/breeds/image/random');
	response = await response.json();
	ctx.replyWithPhoto(response.message, {
		reply_markup: updatedKeyboard,
	})

})

// Обработчик ошибок

bot.catch((err) => {
	const ctx = err.ctx;
	console.log(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;

	if (e instanceof GrammyError) {
		console.error("Error in request:", e.description)
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram", e);
	} else {
		console.error("Unknow error", e);
	}
});

// Запуск бота

bot.start();

// Temp info

// .oneTime() - юзать только один раз
// .resized() - изменение размеров относительно экрана
// .row() - перенос на некст строку


// Temp

// bot.on('msg', async (ctx) => {
// 	console.log(ctx.from);
// 	await ctx.reply(ctx.from)
// });

