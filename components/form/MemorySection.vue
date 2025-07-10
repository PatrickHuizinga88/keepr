<script setup lang="ts">

</script>

<template>
  <FormField v-slot="{ componentField }" name="content">
    <FormItem>
      <FormLabel>{{ $t('memories.content') }}</FormLabel>
      <FormControl>
        <Textarea v-bind="componentField" rows="6"/>
      </FormControl>
      <FormMessage/>
    </FormItem>
  </FormField>

  <FormField v-slot="{ componentField }" name="media">
    <FormItem>
      <FormLabel>{{ $t('memories.sections.media') }}</FormLabel>
      <FormControl>
        <Input type="file" v-bind="componentField"/>
      </FormControl>
      <FormMessage/>
    </FormItem>
  </FormField>
</template>