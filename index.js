// Соединяем бота
require('dotenv').config();
const { Bot, GrammyError, HttpError, InlineKeyboard, Keyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const cron = require('node-cron');
const axios = require('axios');

const bot = new Bot(process.env.BOT_API_KEY);
const ethApi = process.env.ETH_SCAN;
const dogApiMain = process.env.API_DOG_MAIN;
const dogApiSasha = process.env.API_DOG_SASHA;
const dogApiMax = process.env.API_DOG_MAX;
const dogApiNazar = process.env.API_DOG_NAZAR;
const ynApi = process.env.API_YN;

const fs = require('fs');
const path = require('path');
bot.use(hydrate());

// Вешаем команды и их описание

bot.api.setMyCommands([
	{
		command: 'start',
		description: 'Открыть меню',
	}
])

const menuKeyboard = new InlineKeyboard()
	.text('Собачки', 'dogs').row()
	.text('Котики', 'cats').row()
	.text('Да или нет?', 'yon').row()
	.text('Etherscan', 'eth').row()

bot.command('start', async (ctx) => {
	await ctx.react("❤")

	logUniqueUser(ctx);

	logMessage(ctx, "start");

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запустил бота командой start`);
	await ctx.reply(`*Нажмите кнопку*`, {
		parse_mode: 'MarkdownV2',
		reply_markup: menuKeyboard,
	});
});

// Cron test

// async function sendMessageToClient() {
// 	console.log("Cron job executed");
// 	const chatId = process.env.CHAT_ID;
// 	const message = 'Каждую минуту';

// 	await bot.api.sendMessage(chatId, message);
// }

// cron.schedule('*/1 * * * *', sendMessageToClient);

// Callback на собачек

bot.callbackQuery('dogs', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Еще собачек', 'dogs').row()
		.text('Теперь котиков', 'cats').row()
		.text('Да / Нет', 'yon').row()

	let urlApi = '';

	if (ctx.from.id === 575145613) {
		// Макс
		urlApi = dogApiMax
	} else if (ctx.from.id === 468883364) {
		// Сашка
		urlApi = dogApiSasha
	} else if (ctx.from.id === 1078739693) {
		// Назар
		urlApi = dogApiNazar
	} else {
		// Люди
		urlApi = dogApiMain
	}

	const response = await axios.get(urlApi)

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запросил ещё собачек`);

	logMessage(ctx, "собачек");


	ctx.replyWithPhoto(response.data.message, {
		reply_markup: updatedKeyboard,
	})


})


// Callback на котиков

bot.callbackQuery('cats', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Ещё котиков', 'cats').row()
		.text('Теперь собачек', 'dogs').row()
		.text('Да / Нет', 'yon').row()

	const urlApi = ynApi

	const response = await axios.get(urlApi)

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запросил ещё котиков`);

	logMessage(ctx, "кошечек");

	ctx.replyWithPhoto(response.data[0].url, {
		reply_markup: updatedKeyboard,
	})
})

// Callback на Y or N

bot.callbackQuery('yon', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Да / Нет', 'yon').row()
		.text('Теперь кошечек', 'cats').row()
		.text('Теперь собачек', 'dogs').row();

	const urlApi = 'https://yesno.wtf/api';

	const response = await axios.get(urlApi);

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} выбрал "Да или Нет"`);

	await ctx.reply(`Судьба говорит "${response.data.answer}"`)
	await ctx.replyWithAnimation(response.data.image, {
		reply_markup: updatedKeyboard,
	})

	logMessage(ctx, "Да или Нет");

})

// Callback Etherscan

bot.callbackQuery('eth', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard()
		.text('Etherscan', 'eth').row()
		.text('Да / Нет', 'yon').row()
		.text('Теперь кошечек', 'cats').row()
		.text('Теперь собачек', 'dogs').row();

	const urlApi = ethApi

	const response = await axios.get(urlApi);
	const safeGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);
	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} выбрал "Etherscan"`);

	await ctx.reply(`Etherscan: "${safeGasPrice}"`, {
		reply_markup: updatedKeyboard,
	})

	logMessage(ctx, "Etherscan");

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

function logMessage(ctx, action) {
	const logFilePath = path.join(__dirname, 'Logs', 'logs.txt'); // путь к файлу логов
	let logEntry = "";

	if (action) {
		logEntry = `${ctx.from.username} | ID: ${ctx.from.id} | Выбрал "${action}" | Date: ${new Date().toISOString()}\n`;
	}
	else if (ctx.from?.username && ctx.from?.id && ctx.message?.text) {
		logEntry = `${ctx.from.username} | ID: ${ctx.from.id} | Написал: "${ctx.message.text}" | Date: ${new Date().toISOString()}\n`;
	} else {
		logEntry = `${ctx.from.username} | ID: ${ctx.from.id} | Что-то блять нажал | Date: ${new Date().toISOString()}\n`;
	}

	fs.appendFile(logFilePath, logEntry, (err) => {
		if (err) {
			console.error('Ошибка при записи в файл лога:', err);
		}
	});
}


// Логируем уникальных пользователей

function logUniqueUser(ctx) {
	const userId = ctx.from.id;
	const username = ctx.from.username;
	const logFilePath = path.join(__dirname, 'Logs', 'unique_users.txt'); // путь к файлу с уникальными пользователями

	fs.readFile(logFilePath, 'utf8', (err, data) => {
		if (err) {
			if (err.code === 'ENOENT') {
				// Файл не существует, создаём новый файл и записываем туда пользователя
				fs.writeFile(logFilePath, `${userId} | ${username}\n`, (err) => {
					if (err) console.error('Ошибка при создании файла уникальных пользователей:', err);
				});
			} else {
				console.error('Ошибка при чтении файла уникальных пользователей:', err);
			}
			return;
		}

		// Если файл существует, проверяем, содержится ли уже пользователь в файле
		if (!data.includes(userId)) {
			// Если пользователя нет, добавляем его в файл
			fs.appendFile(logFilePath, `${userId} | ${username}\n`, (err) => {
				if (err) console.error('Ошибка при записи уникального пользователя в файл:', err);
			});
		}
	});
}


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

