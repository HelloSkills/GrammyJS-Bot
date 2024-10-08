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
// const chatId = process.env.CHAT_ID

//Bomb
const pizdaTebe = process.env.PIZDA_TEBE


const fs = require('fs');
const path = require('path');

bot.use(hydrate());

// Путь к файлу, где будем хранить userThresholds
const thresholdsFilePath = path.join(__dirname, 'Logs', 'userThresholds.json');

const userThresholds = {};

const subscribeFilePath = path.join(__dirname, 'Logs', 'userSubscribe.json');

const userSubscriptions = {};


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


	await ctx.reply(`Ниже какого значения Eth Gwei Вы хотите получить оповещение бота? \nВыберите значение Eth Gwei от 1 до 10`)

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


	await ctx.reply(`Выбери свой Eth Gwei \nЕсли необходимо значение больше 10 - отправь цифру в чат`, {
		reply_markup: gasButtonKeyboard
	})

	logMessage(ctx, "Notification");

})


// // Обработчики для кнопок с цифрами
// let selectedValue = null;

for (let i = 1; i <= 10; i++) {
	bot.callbackQuery(`${i}`, async (ctx) => {
		const selectedValue = i;
		console.log(selectedValue);

		const userId = ctx.from.id;
		userThresholds[userId] = selectedValue;

		const response = await axios.get(ethApi);
		const currentGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);

		if (currentGasPrice > selectedValue) {
			await ctx.reply(`Вы установили новое пороговое значение - ${selectedValue}.\nЯ сообщу Вам, когда цена газа Ethereum упадет ниже этого уровня.`);

			saveThresholdsToFile();

			console.log(`Пользователь ${ctx.from.username} установил пороговое значение: ${selectedValue}`);
		} else {
			await ctx.reply(`Вы установили новое пороговое значение - ${selectedValue}. \nОднако текущее значение газа ниже установленного порога, и уведомления Вам не будут отправляться.`);
			delete userThresholds[userId];
			saveThresholdsToFile(); // Обновляем файл после удаления порога

			console.log(`Пороговое значение ${selectedValue} установлено, но текущее значение газа ниже.`);
		}

		logMessage(ctx, `оповещение при Eth Gwei ${selectedValue}`);
	});
}


// Callback на подписку

bot.callbackQuery('subscribe', async (ctx) => {
	// const userId = ctx.from.id;

	// Кнопки для включения и отключения подписки
	const subscribeKeyboard = new InlineKeyboard()
		.text('Включить подписку', 'subscribe_true')
		.text('Отключить подписку', 'subscribe_false');

	await ctx.reply('Хотите получать оповещение по газу каждую минуту? Вы можете включить и отключить отписку в любое время', {
		reply_markup: subscribeKeyboard
	});

	logMessage(ctx, "subscribe");
});

bot.callbackQuery('subscribe_true', async (ctx) => {
	const userId = ctx.from.id



	if (!userSubscriptions[userId]) {
		userSubscriptions[userId] = { userName: `${ctx.from.username}`, subscribed: true };
		console.log(userSubscriptions[userId])


	} else {
		userSubscriptions[userId].userName = ctx.from.username;
		userSubscriptions[userId].subscribed = true;
		console.log(userSubscriptions[userId])
	}

	saveSubscriptionsToFile();

	await ctx.reply('Вы включили подписку на уведомления по цене газа Ethereum.');
	logMessage(ctx, "subscribe_true");
});

bot.callbackQuery('subscribe_false', async (ctx) => {
	const userId = ctx.from.id;

	if (!userSubscriptions[userId]) {
		userSubscriptions[userId] = { subscribed: false };
	} else {
		userSubscriptions[userId].subscribed = false;
	}

	saveSubscriptionsToFile();

	await ctx.reply('Вы отключили подписку на уведомления по цене газа Ethereum.');
	logMessage(ctx, "subscribe_false");
});


//Бомбер

// cron.schedule('*/1 * * * * *', async () => {
// 	const sendUserID = pizdaTebe;
// 	await bot.api.sendMessage(sendUserID, 'Тебе пизда');
// });



async function checkGasPrice() {
	try {
		const response = await axios.get(ethApi);
		const currentGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);
		const status = getStatusEth(currentGasPrice);
		// Проверяем всех пользователей, установивших пороговое значение
		for (const userId in userThresholds) {
			const threshold = userThresholds[userId];
			if (currentGasPrice < threshold) {
				// Отправляем сообщение о достигнутом пороге
				await bot.api.sendMessage(userId, `Цена газа опустилась ниже Вашего порогового значения: ${threshold}.\nТекущее значение Etherscan: ${currentGasPrice} \nСпасибо за выбор нашего сервиса ❤`);
				// Удалим пороговое значение после уведомления и выполненного условия
				delete userThresholds[userId];
			}
		}

		// Проверяем подписчиков
		for (const userId in userSubscriptions) {
			if (userSubscriptions[userId].subscribed) {
				await bot.api.sendMessage(userId, `${status} ${currentGasPrice}  ~  Eth Gwei`);
			}
		}

		// Сохранение в файл после удаления порога
		saveThresholdsToFile();
		saveSubscriptionsToFile();

	} catch (error) {
		console.error('Ошибка при проверке цены газа:', error);
	}
}

// Пример cron-задачи, которая будет проверять цену каждые 5 минут
cron.schedule('*/1 * * * *', checkGasPrice);

// Слушаю пользователей

// Обработка сообщений
bot.on('message:text', async (ctx) => {
	const userId = ctx.from.id;
	let text = ctx.message.text;

	console.log(`Пользователь ${ctx.from.username} отправил: ${ctx.message.text}`)

	// Обработка запятой
	text = text.replace(',', '.');

	// Проверяем, является ли текст числом
	const threshold = parseFloat(text);

	if (isNaN(threshold)) {
		await ctx.reply('Текст это конечно хорошо, но я могу работать только с газом Etherscan.\nПожалуйста, введите число, чтобы установить пороговое значение для газа Ethereum.');
		logMessage(ctx);
		return;
	}

	if (threshold >= 1 && threshold <= 100) {
		const response = await axios.get(ethApi);
		const currentGasPrice = parseFloat(response.data.result.SafeGasPrice).toFixed(2);

		if (currentGasPrice < threshold) {
			await ctx.reply(`Цена газа уже ниже Вашего порогового значения "${threshold}".\nТекущее значение Etherscan: ${currentGasPrice}\n\nЕсли хотите получить уведомление - задайте значение ниже текущего газа на Etherscan.\n\nУведомление отключено!`);

			delete userThresholds[userId];
			saveThresholdsToFile();  // Обновляем файл после удаления порога
		} else {
			if (userThresholds[userId] !== undefined) {
				console.log(`Пользователь ${ctx.from.username} обновил пороговое значение с ${userThresholds[userId]} на ${threshold}`);
				delete userThresholds[userId];
			}

			userThresholds[userId] = threshold;
			console.log(`Пользователь ${ctx.from.username} установил новое пороговое значение: ${threshold}`);

			if (currentGasPrice >= threshold) {
				saveThresholdsToFile();
			}

			await ctx.reply(`Вы установили новое пороговое значение - ${threshold}.\n\nЯ сообщу Вам, когда цена газа Ethereum упадет ниже этого уровня.`);
		}
	} else if (threshold < 1) {
		await ctx.reply('Eth Gwei не может быть меньше 1\nВыберите диапазон 1 ~ 100');
	} else {
		await ctx.reply('Выберите интервал в диапазоне от 1 до 100');
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


// Функция для сохранения выставленного газа в файл
function saveThresholdsToFile() {
	try {
		fs.writeFileSync(thresholdsFilePath, JSON.stringify(userThresholds, null, 2));
		// console.log('Thresholds saved to file.');
	} catch (err) {
		console.error('Error saving thresholds to file:', err);
	}
}

// Функция для загрузки значений о газе от пользхователей из файла
function loadThresholdsFromFile() {
	try {
		if (fs.existsSync(thresholdsFilePath)) {
			const data = fs.readFileSync(thresholdsFilePath, 'utf8');
			Object.assign(userThresholds, JSON.parse(data));
			// console.log('Thresholds loaded from file.');
		}
	} catch (err) {
		console.error('Error loading thresholds from file:', err);
	}
}

// Загрузка данных из файла при старте бота
loadThresholdsFromFile();

// Функция для сохранения данных о подписке в файл
function saveSubscriptionsToFile() {
	try {
		fs.writeFileSync(subscribeFilePath, JSON.stringify(userSubscriptions, null, 2));
	} catch (err) {
		console.error('Error saving subscriptions to file:', err);
	}
}

// Функция для загрузки данных о подписке из файла
function loadSubscriptionsFromFile() {
	try {
		if (fs.existsSync(subscribeFilePath)) {
			const data = fs.readFileSync(subscribeFilePath, 'utf8');
			Object.assign(userSubscriptions, JSON.parse(data));
		}
	} catch (err) {
		console.error('Error loading subscriptions from file:', err);
	}
}

// Загрузка данных о подписках при старте бота
loadSubscriptionsFromFile();


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

