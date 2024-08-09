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
		description: 'Старт бота',
	},
	{
		command: 'menu',
		description: 'Меню бота',
	}
])


// Вешаем слушателя на конкретную команду тг

bot.command('start', async (ctx) => {
	await ctx.react("❤")
	await ctx.reply('<b>HelloSkillsWeb</b> приветствует Вас, выберите подходящую команду бота', {
		parse_mode: 'HTML'
	})
});

const menuKeyboard = new InlineKeyboard()
	.text('Узнать статус заказа', 'order-status')
	.text('Обратиться в поддержку', 'support')

const backKeyboard = new InlineKeyboard().text('< Назад в меню', 'back')

bot.command('menu', async (ctx) => {
	await ctx.reply('Выберите пункт меню', {
		reply_markup: menuKeyboard,
	});
});

bot.callbackQuery('order-status', async (ctx) => {
	await ctx.callbackQuery.message.editText('Статус заказа: в пути', {
		reply_markup: backKeyboard,
	})
	await ctx.answerCallbackQuery();
})

bot.callbackQuery('support', async (ctx) => {
	await ctx.callbackQuery.message.editText('Напишите Ваш запрос', {
		reply_markup: backKeyboard,
	})
	await ctx.answerCallbackQuery();
})

bot.callbackQuery('back', async (ctx) => {
	await ctx.callbackQuery.message.editText('Выберите пункт меню', {
		reply_markup: menuKeyboard,
	})
	await ctx.answerCallbackQuery();
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

