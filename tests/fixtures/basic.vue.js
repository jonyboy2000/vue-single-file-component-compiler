require('insert-css')("\ncomp-a h2 {\n  color: #f00;\n}\n");

export default {
  data () {
    return {
      msg: 'Hello from Component A!'
    }
  }
}

module.exports.template = "\n  <h2 class=\"red\">{{msg}}</h2>\n  <style></style>\n";
