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


// Вешаем слушателя на конкретную команду тг

// bot.command('start', async (ctx) => {
// 	await ctx.react("❤")
// 	await ctx.reply('<b>HelloSkillsWeb</b> приветствует Вас, выберите подходящую команду бота', {
// 		parse_mode: 'HTML'
// 	})
// });

// .text('Скоро сделаем', 'soon')

// const backKeyboard = new InlineKeyboard().text('< Назад в меню', 'back')

const menuKeyboard = new InlineKeyboard().text('Собачки', 'dogs')


bot.command('start', async (ctx) => {
	await ctx.react("❤")
	await ctx.reply(`*Нажмите кнопку*`, {
		parse_mode: 'MarkdownV2',
		reply_markup: menuKeyboard,
	});
});

bot.callbackQuery('dogs', async (ctx) => {
	// await ctx.react("❤");
	const updatedKeyboard = new InlineKeyboard().text('Еще собачек', 'dogs');
	let response = await fetch('https://dog.ceo/api/breeds/image/random');
	response = await response.json();
	ctx.replyWithPhoto(response.message, {
		reply_markup: updatedKeyboard,
	})

})

// bot.callbackQuery('soon', async (ctx) => {
// 	await ctx.callbackQuery.message.editText('Кнопка скоро будет доступна', {
// 		reply_markup: backKeyboard,
// 	})
// 	await ctx.answerCallbackQuery();
// })

// bot.callbackQuery('back', async (ctx) => {
// 	await ctx.callbackQuery.message.editText('Выберите пункт меню', {
// 		reply_markup: menuKeyboard,
// 	})
// 	await ctx.answerCallbackQuery();
// })

// const data = fetch('https://jsonplaceholder.typicode.com/users')
// 	.then((data) => {
// 		return data.json();
// 	})
// 	.then((info) => {
// 		console.log(info)
// 	})

// bot.command('fetch', async (ctx) => {
// 	await ctx.react("❤");

// 	try {
// 		// Fetch the data from the API
// 		const response = await fetch('https://dog.ceo/api/breeds/image/random');
// 		const data = await response.json();

// 		// Reply with the fetched data
// 		await ctx.reply(JSON.stringify(data, null, 2)); // Format JSON for readability
// 	} catch (error) {
// 		// Handle any errors
// 		await ctx.reply('An error occurred while fetching data.');
// 		console.error(error);
// 	}
// });


// bot.command('fetch', async (ctx) => {
// 	await ctx.react("❤");

// 	let response = await fetch('https://dog.ceo/api/breeds/image/random');
// 	response = await response.json();

// 	// Reply with the fetched data
// 	ctx.reply(response.message); // Format JSON for readability

// })

// bot.command('fetch', async (ctx) => {
// 	await ctx.react("❤")
// 	await ctx.reply(ctx.from)
// });

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

// Обработка войса и других типов

// bot.on('message:voice', async (ctx) => {
// 	await ctx.reply('Войс, серьёзно?')
// });

// Слушатель по тексту

// bot.hears(['Слово', 'СЛОВО'], async (ctx) => {
// 	await ctx.reply('Перехватил слово!')
// });

// Выцепляет текст из сообщения

// bot.hears([/пипец/, /Пипец/], async (ctx) => {
// 	await ctx.reply('Ругаемся?')
// });


// Фильтры

// bot.on('msg').filter((ctx) => {
// 	return ctx.from.id = 418814235
// }, async (ctx) => {
// 	await ctx.reply('Привет, админ!')
// })


// fetch('https://jsonplaceholder.typicode.com/todos/1')
// 	.then((data) => {
// 		return data.json();
// 	}).then((info) => {
// 		console.log(info)
// 	})

