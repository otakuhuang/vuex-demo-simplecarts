<template>
  <ul>
    <li
        v-for="product in products"
        :key="product.id">
      {{ product.title }} - {{ product.price }} - {{ product.inventory }}
      <br/>
      <button
          :disabled="product.need === 0"
          @click="reduceProductToCart(product)">
        -
      </button>
      <input type="number" :max="product.inventory" min="0" v-model.number="product.selected"
             @input="changeProductToCart(product)"
             style="width: 40px; text-align: center;">
      <button
          :disabled="product.need === product.inventory"
          @click="addProductToCart(product)">
        +
      </button>
    </li>
  </ul>
</template>

<script>
import {mapState, mapActions} from 'vuex';

export default {
  name: "ProductList",
  // 将 store 中的 products module 的 all 赋值给当前页面的 products
  computed: mapState({
    products: state => state.products.all,
  }),
  // computed: {
  //   products() {
  //     return this.$store.state.products.all;
  //   }
  // },
  // mapActions 调用 cart 中的 addProductToCart 中的两个 mutation
  methods: mapActions('cart', [
    'addProductToCart',
    'reduceProductToCart',
    'changeProductToCart',
  ]),
  // methods: {
  //   addProductToCart(product) {
  //     this.$store.dispatch('cart/addProductToCart', product);
  //   }
  // }
  created() {
    // 进来调用 dispatch 调用 getAllProducts acton
    this.$store.dispatch('products/getAllProducts');
  }
}
</script>

<style scoped>

</style>