<template>
    <img class="flag" :src="'locale/' + loc + '.svg'" :alt="loc" />
</template>
<script>
export default {
    props: {
        loc: {
            type: String,
            required: true,
        },
    },
};
</script>
<style>
img.flag {
    height: 1em;
    vertical-align: baseline;
}
</style>