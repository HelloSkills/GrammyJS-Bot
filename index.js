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


// Логируемся


bot.command('start', async (ctx) => {
	await ctx.react("❤")
	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запустил бота командой start`);
	await ctx.reply(`*Нажмите кнопку*`, {
		parse_mode: 'MarkdownV2',
		reply_markup: menuKeyboard,
	});
});

bot.callbackQuery('dogs', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Еще собачек', 'dogs');
	let response = await fetch('https://dog.ceo/api/breeds/image/random');
	response = await response.json();
	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запросил ещё собачек`);
	ctx.replyWithPhoto(response.message, {
		reply_markup: updatedKeyboard,
	})
})

bot.on('msg', async (ctx) => {
	console.log(`Пользователь с ID: ${ctx.from.id} написал текст ${ctx.message.text}`);
	// await ctx.reply(ctx.message.text)
});

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

