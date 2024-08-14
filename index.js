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
const chatId = process.env.CHAT_ID

const fs = require('fs');
const path = require('path');

const userThresholds = {};

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
		.text('Etherscan', 'eth').row()

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
		.text('Etherscan', 'eth').row()

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
		.text('Теперь собачек', 'dogs').row()
		.text('Etherscan', 'eth').row()

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
		.text('Подписка на ETH Gwei', 'subscribe').row()
		.text('Оповестить при моём Gwei', 'notification').row()


	const urlApi = ethApi

	const response = await axios.get(urlApi);
	const safeGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);
	const status = getStatusEth(safeGasPrice)
	console.log(`Пользователь ${ctx.from.username} и ID: ${ctx.from.id} выбрал "Etherscan"`);



	await ctx.reply(`${status} Eth Gwei: ${safeGasPrice}`, {
		reply_markup: updatedKeyboard,
	})

	logMessage(ctx, "Etherscan");

})

// Callback на оповещение

bot.callbackQuery('notification', async (ctx) => {
	const updatedKeyboard = new InlineKeyboard()
		.text('Etherscan', 'eth').row()
		.text('Подписка на ETH Gwei', 'subscribe').row()
		.text('Вернуться в главное меню', 'start').row()

	await ctx.reply(`Ниже какого значения Eth Gwei Вы хотите получить оповещение бота? \nОтправьте любое значение от 1`)

	const gasButtonKeyboard = new InlineKeyboard()
		.text('1', '1').row()
		.text('2', '2')
		.text('3', '3').row()
		.text('4', '4')
		.text('5', '5').row()
		.text('6', '6')
		.text('7', '7').row()
		.text('8', '8')
		.text('9', '9').row()
		.text('10', '10')


	await ctx.reply(`Выберите значение Eth Gwei от 1 до 10 \nЕсли необходимо значение больше - отправь цифру в чат`, {
		reply_markup: gasButtonKeyboard
	})
	// await ctx.reply(` `, {
	// 	reply_markup: updatedKeyboard,
	// })

	logMessage(ctx, "notification");

})

//Бомбер

// cron.schedule('*/1 * * * * *', async () => {
// 	const sendUserID = chatId;
// 	await bot.api.sendMessage(sendUserID, 'Спам);
// });



async function checkGasPrice() {
	try {
		const sendUserID = chatId
		const response = await axios.get(ethApi);
		const currentGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);

		//Проверка на логирование
		if (Object.keys(userThresholds).length > 0) {
			console.log(`Пользователи установили: ${JSON.stringify(userThresholds, null, 2)}`);
		}

		const status = getStatusEth(currentGasPrice)

		console.log(`${status} Eth Gwei: ${currentGasPrice}`);
		//Отправляем инфу о газе по расписанию крона конкретному ID
		await bot.api.sendMessage(sendUserID, `${status} Eth Gwei ${currentGasPrice}`);

		// Проверяем всех пользователей, установивших пороговое значение
		for (const userId in userThresholds) {
			const threshold = userThresholds[userId];
			if (currentGasPrice < threshold) {
				// Отправляем уведомление пользователю
				await bot.api.sendMessage(userId, `Цена газа уже ниже Вашего порогового значения "${threshold}".\nТекущее значение Etherscan: ${currentGasPrice}`);
				// Удалим пороговое значение после уведомления и выполненного условия
				delete userThresholds[userId];
			}
		}
	} catch (error) {
		console.error('Ошибка при проверке цены газа:', error);
	}
}

// Пример cron-задачи, которая будет проверять цену каждые 5 минут
cron.schedule('*/1 * * * *', checkGasPrice);

// Слушаю пользователей

bot.on('message:text', async (ctx) => {
	const userId = ctx.from.id;
	let text = ctx.message.text;

	console.log(text)


	// Обработка запятой
	text = text.replace(',', '.');

	// Проверяем, является ли текст числом
	const threshold = parseFloat(text);

	console.log(threshold)

	if (isNaN(text)) {
		await ctx.reply('Текст это конечно хорошо, но я могу работать только с газом Etherscan.\nПожалуйста, введите число, чтобы установить пороговое значение для газа Ethereum.')
		logMessage(ctx);
		return
	}


	if (!isNaN(threshold) && threshold >= 1 && threshold <= 100) {
		// Получаем текущую цену газа
		const response = await axios.get(ethApi);
		const currentGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);
		console.log(`Текущее значение Etherscan: ${currentGasPrice}`);

		// Проверяем, не ниже ли уже текущая цена газа, чем введенное значение
		if (currentGasPrice < threshold) {
			// Если новое значение больше текущей цены газа, удаляем пороговое значение пользователя
			if (userThresholds[userId] !== undefined) {
				console.log(`Пороговое значение ${userThresholds[userId]} для пользователя ${ctx.from.username} удалено, так как текущее значение газа ниже порога.`);
				delete userThresholds[userId];
			}

			await ctx.reply(`Цена газа уже ниже Вашего порогового значения "${threshold}".\nТекущее значение Etherscan: ${currentGasPrice} \n \nЕсли хотите получить уведомление - задайте значение ниже текущего газа на Etherscan. \n \nУведомление отключено!`);
		} else {
			// Если пороговое значение для пользователя уже существует, удаляем его
			if (userThresholds[userId] !== undefined) {
				console.log(`Пользователь ${ctx.from.username} обновил пороговое значение с ${userThresholds[userId]} на ${threshold}`);
				delete userThresholds[userId];
			}

			// Устанавливаем новое пороговое значение
			userThresholds[userId] = threshold;
			console.log(`Пользователь ${ctx.from.username} установил новое пороговое значение: ${threshold}`);

			await ctx.reply(`Вы установили новое пороговое значение - ${threshold}.\n \nЯ сообщу Вам, когда цена газа Ethereum упадет ниже этого уровня.`);
		}
	} else {
		await ctx.reply('Eth Gwei не может быть меньше 1 \nУкажите любое значение от 1 до 100');
	}

	logMessage(ctx);
});


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

// Функция получения статуса Eth Gwei

function getStatusEth(safeGasPrice) {


	if (safeGasPrice <= 5) {
		return '🟢'
	} else if (safeGasPrice > 5 && safeGasPrice <= 10) {
		return '🟡'
	} else {
		return '🔴'
	}
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

