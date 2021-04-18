<template>
  <div>
    <ShowFile
      :queryFileType="queryFileType"
      :default-grid="false"
      :orderCustom="true"
      :context-menus="[]"
      :sortable="sortable"
      :queryCondition="queryCondition"
      emptyStatus="还没有音乐呢~">
    </ShowFile>
  </div>
</template>

<script>
import ShowFile from "@/components/ShowFile/ShowFile";

export default {
  components: {ShowFile},
  data() {
    return {
      sortable: {
        prop: 'name', order: 'descending'
      },
      queryCondition: {
        isFolder: false
      },
      queryFileType: 'audio'
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

</style>
