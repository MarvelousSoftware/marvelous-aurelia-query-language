# Getting started
The `marvelous-aurelia-query-language` is an open source domain specific language built on top of <code>.NET</code> platform. 
It allows to filter data using custom syntax. The goal is to provide advanced users a way to quickly get needed data.
It has built-in support for auto completions. Although the code editor is using aurelia framework the further version will 
provide a separate, independent package.

Project documentation: [http://marvelous.software/docs.html#/query-language](http://marvelous.software/docs.html#/query-language)

Please bear in mind that this library is still in the early beta and some features might be missing.

## Installation
The `marvelous-aurelia-query-language` consists of 2 packages: client side and server side. First install client side library:
```
jspm install marvelous-aurelia-query-language
```
Then load the css file and let know aurelia about the query language plugin:
```javascript
import 'marvelous-aurelia-query-language/styles/default.css!';
// ...

export function configure(aurelia) {  
  let config = aurelia.use;
  
  config
    // ...
    .plugin('marvelous-aurelia-query-language');
  
  aurelia.start().then(a => {
    a.setRoot();
  });
}
```
To install server side part of the library use following NuGet install command:
```
Install-Package MarvelousSoftware.QueryLanguage
```
Once you do that install either `MarvelousSoftware.Core.Host.Owin` or `MarvelousSoftware.Core.Host.SystemWeb` NuGet package and use 
it on the application start up:
```csharp
using System.Web;
using MarvelousSoftware.Core.Host.SystemWeb;

namespace MarvelousSoftware.Examples.API
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            // This line allows to use MarvelousSoftware products with SystemWeb
            // It comes from MarvelousSoftware.Core.Host.SystemWeb package
            MarvelousSoftwareHost.UseSystemWeb();
            
            // If you would like to use MarvelousSoftware products with more modern, Owin based applications
            // then use MarvelousSoftware.Core.Host.Owin package and place below line in Startup.cs file 
            // app.UseMarvelousSoftware();
            
            //.. rest of app's startup configuration
        }
    }
}
```
Now you are ready to go.

## Browser support
Currently only modern browsers are supported, but IE >= 9 support is on the TODO list.

## License
GNU General Public License is the only option for now, but commercial license will be available in the future.
It will not be free, but price will be really reasonable.

## Dependencies
* aurelia-dependency-injection
* aurelia-templating
* marvelous-aurelia-core

## Building The Code
This repository depends on other marvelous software repositories. In order to provide seamless development flow these libraries are watched automatically. The only prerequisite is following directories structure:

-- MarvelousSoftware

--- marvelous-aurelia-query-language

--- marvelous-aurelia-core

Once the structure is correct `gulp watch` command will listen to dependend libraries changes.
