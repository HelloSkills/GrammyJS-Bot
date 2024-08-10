// Соединяем бота
require('dotenv').config();
const { Bot, GrammyError, HttpError, InlineKeyboard, Keyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const bot = new Bot(process.env.BOT_API_KEY);
const catApi = process.env.CAT_API;
const fs = require('fs');
const path = require('path');
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

const menuKeyboard = new InlineKeyboard()
	.text('Собачки', 'dogs')
	.text('Котики', 'cats')


bot.command('start', async (ctx) => {
	await ctx.react("❤")

	logMessage(ctx);

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запустил бота командой start`);
	await ctx.reply(`*Нажмите кнопку*`, {
		parse_mode: 'MarkdownV2',
		reply_markup: menuKeyboard,
	});
});

// Callback на собачек

bot.callbackQuery('dogs', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Еще собачек', 'dogs').text('Теперь котиков', 'cats')
	let response = await fetch('https://dog.ceo/api/breeds/image/random');
	response = await response.json();
	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запросил ещё собачек`);

	logMessage(ctx);


	ctx.replyWithPhoto(response.message, {
		reply_markup: updatedKeyboard,
	})
})

// Callback на котиков

bot.callbackQuery('cats', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Ещё котиков', 'cats').text('Теперь собачек', 'dogs');

	let response = await fetch('https://api.thecatapi.com/v1/images/search');
	response = await response.json();

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запросил ещё котиков`);

	logMessage(ctx);


	ctx.replyWithPhoto(response[0].url, {
		reply_markup: updatedKeyboard,
	})
})

//API authorization temp

// bot.callbackQuery('cats', async (ctx) => {
// 	const updatedKeyboard = new InlineKeyboard().text('Ещё котиков', 'cats').text('Теперь собачек', 'dogs');

// 	let response = await fetch('https://api.thecatapi.com/v1/images/search?limit=15&breed_ids=beng', {
// 		headers: {
// 			'x-api-key': catApi
// 			// в x-api-key передаём наш API_KEY от Cat в catApi
// 		}
// 	});
// 	response = await response.json();
// 	// console.log(response);
// 	ctx.reply(response.map(item => item.url), {
// 		reply_markup: updatedKeyboard,
// 	})
// })

// Логируем текст

bot.on('msg', async (ctx) => {

	logMessage(ctx);

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} написал текст "${ctx.message.text}"`)
	// await ctx.reply(ctx.message.text) 
	// ctx.reply - для ответа клиенту
});

// Логируем в файлик (функция)

function logMessage(ctx) {
	const logFilePath = path.join(__dirname, 'Logs', 'logs.txt'); // путь к файлу логов
	let logEntry = "";

	if (ctx.from?.username && ctx.from?.id && ctx.message?.text) {
		logEntry = `${ctx.from.username} | ID: ${ctx.from.id} | Message: ${ctx.message.text} | Date: ${new Date().toISOString()}\n`;

	} else {
		logEntry = `${ctx.from.username} | ID: ${ctx.from.id} | Нажал кнопку | Date: ${new Date().toISOString()}\n`;
	}

	fs.appendFile(logFilePath, logEntry, (err) => {
		if (err) {
			console.error('Ошибка при записи в файл лога:', err);
		}
	});
}

// function logMessage(userNickname, userId, message) {
// 	const logFilePath = path.join(__dirname, 'Logs', 'logs.txt'); // путь к файлу логов
// 	const logEntry = `${userNickname} | ID: ${userId} | Message: ${message} | Date: ${new Date().toISOString()}\n`;

// 	fs.appendFile(logFilePath, logEntry, (err) => {
// 		if (err) {
// 			console.error('Ошибка при записи в файл лога:', err);
// 		}
// 	});
// }



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

