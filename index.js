// Соединяем бота
require('dotenv').config();
const { Bot, GrammyError, HttpError, InlineKeyboard, Keyboard } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const axios = require('axios');
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
])

const menuKeyboard = new InlineKeyboard()
	.text('Собачки', 'dogs').row()
	.text('Котики', 'cats').row()
	.text('Да или нет?', 'yon').row()

bot.command('start', async (ctx) => {
	await ctx.react("❤")

	logMessage(ctx, "start");

	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} запустил бота командой start`);
	await ctx.reply(`*Нажмите кнопку*`, {
		parse_mode: 'MarkdownV2',
		reply_markup: menuKeyboard,
	});
});

// Callback на собачек

bot.callbackQuery('dogs', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard().text('Еще собачек', 'dogs').row()
		.text('Теперь котиков', 'cats').row()
		.text('Да / Нет', 'yon').row()

	let urlApi = '';

	if (ctx.from.id === 575145613) {
		// Макс
		urlApi = 'https://dog.ceo/api/breed/bulldog/french/images/random'
	} else if (ctx.from.id === 468883364) {
		// Сашка
		urlApi = 'https://dog.ceo/api/breed/doberman/images/random'
	} else {
		// Люди
		urlApi = 'https://dog.ceo/api/breeds/image/random'
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

	const urlApi = 'https://api.thecatapi.com/v1/images/search'

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

// Callback Temp



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

