const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { board, build } = ctx.params;
    const response = await got({
        method: 'get',
        url: `http://api.ineal.me/tss/${board}/${build}`,
    });

    const resultItem = Object.values(response.data).map((item) => {
        const firmware = item.firmwares[0];
        const description = `
      <strong>signing:</strong> ${firmware.signing.toString()}<br>
      <strong>started:</strong> ${firmware.started}<br>
      <strong>stopped:</strong> ${firmware.stopped}<br>
      <strong>model:</strong> ${item.model}<br>
      <strong>board:</strong> ${item.board}<br>
      <strong>version:</strong> ${firmware.version}<br>
      <strong>build:</strong> ${firmware.build}<br>
    `;

        return {
            title: `signing: ${firmware.signing.toString()}-${item.model}-${firmware.version}`,
            description,
            guid: `${firmware.started} / ${firmware.stopped}`,
        };
    });

    ctx.state.data = {
        title: 'TSSstatus',
        link: 'http://api.ineal.me/tss/status',
        description: "Real time status of every iOS firmware currently being signed by Apple's TSS server.",
        item: resultItem,
    };
};
