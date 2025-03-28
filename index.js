require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const FILE_NAME = 'solicitudes.txt';
const MAX_SOLICITUDES = 2;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
  .setName('imagen')
  .setDescription('Solicita una imagen (hasta 2 veces por día)')
  .addStringOption(option =>
    option.setName('prompt')
      .setDescription('¿Qué quieres que se genere?')
      .setRequired(true)
  );

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('📡 Registrando comandos...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [command.toJSON()] }
    );
    console.log('✅ Comandos registrados');
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'imagen') return;

  const prompt = interaction.options.getString('prompt');
  const userId = interaction.user.id;
  const today = new Date().toISOString().split('T')[0];

  const logPath = path.join(__dirname, FILE_NAME);

  // Crear archivo si no existe
  if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, '');

  // Leer solicitudes anteriores
  const data = fs.readFileSync(logPath, 'utf8');
  const lines = data.trim().split('\n').filter(Boolean);

  // Contar cuántas solicitudes ha hecho este usuario hoy
  const countToday = lines.filter(line => {
    const [date, uid] = line.split(' | ');
    return date === today && uid === userId;
  }).length;

  if (countToday >= MAX_SOLICITUDES) {
    await interaction.reply({ content: '⚠️ Ya has alcanzado tu límite de 2 solicitudes para hoy.', ephemeral: true });
    return;
  }

  // Registrar nueva solicitud
  fs.appendFileSync(logPath, `${today} | ${userId} | ${prompt}\n`);

  await interaction.reply(`🎨 Solicitud registrada: **${prompt}**\n(Usadas hoy: ${countToday + 1}/2)`);
});

client.login(process.env.DISCORD_TOKEN);



"// Comentario para activar despliegue" 
